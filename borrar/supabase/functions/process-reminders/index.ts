import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REMINDERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
      },
    }
  );

  try {
    logStep("Starting reminder processing");

    // Get pending reminders
    const { data: reminders, error: remindersError } = await supabaseClient
      .rpc('get_pending_reminders');

    if (remindersError) {
      throw new Error(`Error fetching reminders: ${remindersError.message}`);
    }

    logStep("Found pending reminders", { count: reminders?.length || 0 });

    const processedReminders = [];

    for (const reminder of reminders || []) {
      try {
        // Get user profile for email
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', reminder.user_id)
          .single();

        if (profile?.email) {
          // Send email notification
          await supabaseClient.functions.invoke('send-notification-email', {
            body: {
              to: profile.email,
              subject: reminder.title,
              message: reminder.message,
              type: 'course_reminder',
              data: {
                userName: profile.full_name,
                courseName: reminder.metadata?.course_name || 'tu curso',
                userId: reminder.user_id
              }
            }
          });

          logStep("Email sent for reminder", { reminderId: reminder.id });

          // Create in-app notification
          await supabaseClient.from('notifications').insert({
            user_id: reminder.user_id,
            title: reminder.title,
            message: reminder.message,
            type: 'reminder',
            action_url: reminder.course_id ? `/courses/${reminder.course_id}` : null,
            metadata: reminder.metadata
          });

          // Mark reminder as sent
          await supabaseClient.rpc('mark_reminder_sent', {
            reminder_id: reminder.id
          });

          processedReminders.push({
            id: reminder.id,
            status: 'sent',
            email: profile.email
          });
        } else {
          logStep("No email found for user", { userId: reminder.user_id });
          processedReminders.push({
            id: reminder.id,
            status: 'failed',
            reason: 'No email found'
          });
        }
      } catch (error) {
        logStep("Error processing reminder", { 
          reminderId: reminder.id, 
          error: error.message 
        });
        processedReminders.push({
          id: reminder.id,
          status: 'failed',
          reason: error.message
        });
      }
    }

    logStep("Reminder processing completed", { 
      processedCount: processedReminders.length 
    });

    return new Response(JSON.stringify({
      success: true,
      processed_count: processedReminders.length,
      reminders: processedReminders
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    logStep("ERROR in process-reminders", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
