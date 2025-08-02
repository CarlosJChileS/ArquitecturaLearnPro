import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { useFooterData, FooterLink, FooterContact, FooterSocial, FooterSettings } from "@/hooks/useFooterData";

interface FooterConfigProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const FooterConfig: React.FC<FooterConfigProps> = ({ onSave, onCancel }) => {
  const { links, contacts, socials, settings } = useFooterData();
  
  const [editedLinks, setEditedLinks] = useState<FooterLink[]>(links);
  const [editedContacts, setEditedContacts] = useState<FooterContact[]>(contacts);
  const [editedSocials, setEditedSocials] = useState<FooterSocial[]>(socials);
  const [editedSettings, setEditedSettings] = useState<FooterSettings | null>(settings);

  // Links Management
  const addLink = (category: 'quick_links' | 'categories' | 'legal') => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      title: 'Nuevo enlace',
      url: '/',
      category,
      order_index: editedLinks.filter(l => l.category === category).length + 1,
      is_active: true
    };
    setEditedLinks([...editedLinks, newLink]);
  };

  const updateLink = (id: string, field: keyof FooterLink, value: any) => {
    setEditedLinks(editedLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const deleteLink = (id: string) => {
    setEditedLinks(editedLinks.filter(link => link.id !== id));
  };

  // Contacts Management
  const addContact = (type: 'email' | 'phone' | 'address') => {
    const newContact: FooterContact = {
      id: Date.now().toString(),
      type,
      value: '',
      description: '',
      is_primary: false
    };
    setEditedContacts([...editedContacts, newContact]);
  };

  const updateContact = (id: string, field: keyof FooterContact, value: any) => {
    setEditedContacts(editedContacts.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const deleteContact = (id: string) => {
    setEditedContacts(editedContacts.filter(contact => contact.id !== id));
  };

  // Socials Management
  const addSocial = () => {
    const newSocial: FooterSocial = {
      id: Date.now().toString(),
      platform: 'facebook',
      url: '',
      is_active: true
    };
    setEditedSocials([...editedSocials, newSocial]);
  };

  const updateSocial = (id: string, field: keyof FooterSocial, value: any) => {
    setEditedSocials(editedSocials.map(social => 
      social.id === id ? { ...social, [field]: value } : social
    ));
  };

  const deleteSocial = (id: string) => {
    setEditedSocials(editedSocials.filter(social => social.id !== id));
  };

  // Settings Management
  const updateSettings = (field: keyof FooterSettings, value: string) => {
    if (editedSettings) {
      setEditedSettings({ ...editedSettings, [field]: value });
    }
  };

  const handleSave = () => {
    const footerData = {
      links: editedLinks,
      contacts: editedContacts,
      socials: editedSocials,
      settings: editedSettings
    };
    
    // Here you would typically save to your backend/database
    console.log('Saving footer data:', footerData);
    
    // For now, we'll save to localStorage as a demo
    localStorage.setItem('footerConfig', JSON.stringify(footerData));
    
    if (onSave) {
      onSave(footerData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Footer</h2>
          <p className="text-muted-foreground">
            Gestiona los enlaces, contactos y configuración del pie de página
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Configuración General</TabsTrigger>
          <TabsTrigger value="links">Enlaces</TabsTrigger>
          <TabsTrigger value="contacts">Contacto</TabsTrigger>
          <TabsTrigger value="socials">Redes Sociales</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura la información básica de la empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nombre de la Empresa</Label>
                  <Input
                    id="company_name"
                    value={editedSettings?.company_name || ''}
                    onChange={(e) => updateSettings('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_text">Texto del Logo</Label>
                  <Input
                    id="logo_text"
                    value={editedSettings?.logo_text || ''}
                    onChange={(e) => updateSettings('logo_text', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_description">Descripción de la Empresa</Label>
                <Textarea
                  id="company_description"
                  value={editedSettings?.company_description || ''}
                  onChange={(e) => updateSettings('company_description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyright_text">Texto de Copyright</Label>
                <Input
                  id="copyright_text"
                  value={editedSettings?.copyright_text || ''}
                  onChange={(e) => updateSettings('copyright_text', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletter_title">Título del Newsletter</Label>
                  <Input
                    id="newsletter_title"
                    value={editedSettings?.newsletter_title || ''}
                    onChange={(e) => updateSettings('newsletter_title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter_description">Descripción del Newsletter</Label>
                  <Input
                    id="newsletter_description"
                    value={editedSettings?.newsletter_description || ''}
                    onChange={(e) => updateSettings('newsletter_description', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <div className="grid gap-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Enlaces Rápidos</CardTitle>
                    <CardDescription>Gestiona los enlaces de navegación principal</CardDescription>
                  </div>
                  <Button onClick={() => addLink('quick_links')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {editedLinks.filter(link => link.category === 'quick_links').map((link) => (
                    <div key={link.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Título"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Categorías</CardTitle>
                    <CardDescription>Gestiona los enlaces de categorías de cursos</CardDescription>
                  </div>
                  <Button onClick={() => addLink('categories')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {editedLinks.filter(link => link.category === 'categories').map((link) => (
                    <div key={link.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Título"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legal Links */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Enlaces Legales</CardTitle>
                    <CardDescription>Gestiona los enlaces de términos, privacidad, etc.</CardDescription>
                  </div>
                  <Button onClick={() => addLink('legal')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {editedLinks.filter(link => link.category === 'legal').map((link) => (
                    <div key={link.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Título"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>Gestiona la información de contacto</CardDescription>
                </div>
                <div className="space-x-2">
                  <Button onClick={() => addContact('email')} size="sm" variant="outline">
                    Email
                  </Button>
                  <Button onClick={() => addContact('phone')} size="sm" variant="outline">
                    Teléfono
                  </Button>
                  <Button onClick={() => addContact('address')} size="sm" variant="outline">
                    Dirección
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editedContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Badge variant="outline">{contact.type}</Badge>
                    <Input
                      placeholder="Valor"
                      value={contact.value}
                      onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Descripción"
                      value={contact.description}
                      onChange={(e) => updateContact(contact.id, 'description', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="socials">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription>Gestiona los enlaces de redes sociales</CardDescription>
                </div>
                <Button onClick={addSocial} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {editedSocials.map((social) => (
                  <div key={social.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <select
                      value={social.platform}
                      onChange={(e) => updateSocial(social.id, 'platform', e.target.value)}
                      className="px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <Input
                      placeholder="URL"
                      value={social.url}
                      onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSocial(social.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FooterConfig;
