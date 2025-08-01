import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el usuario es admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Access denied. Admin role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { method } = req;
    const url = new URL(req.url);
    const bucket = url.searchParams.get('bucket');
    const filePath = url.searchParams.get('path');

    switch (method) {
      case 'GET': {
        if (!bucket) {
          // Listar todos los buckets
          const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();

          if (bucketsError) {
            return new Response(JSON.stringify({ error: bucketsError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          return new Response(JSON.stringify(buckets), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } else {
          // Listar archivos en un bucket
          const { data: files, error: filesError } = await supabaseClient.storage
            .from(bucket)
            .list('', {
              limit: 100,
              offset: 0
            });

          if (filesError) {
            return new Response(JSON.stringify({ error: filesError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Agregar URLs públicas a los archivos
          const filesWithUrls = files.map(file => {
            const { data: urlData } = supabaseClient.storage
              .from(bucket)
              .getPublicUrl(file.name);

            return {
              ...file,
              publicUrl: urlData.publicUrl
            };
          });

          return new Response(JSON.stringify(filesWithUrls), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      case 'DELETE': {
        if (!bucket || !filePath) {
          return new Response(JSON.stringify({ error: 'Bucket and file path are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error: deleteError } = await supabaseClient.storage
          .from(bucket)
          .remove([filePath]);

        if (deleteError) {
          console.error('Error deleting file:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ message: 'File deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
