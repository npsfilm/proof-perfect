import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { useCompanyBilling, useUpsertCompanyBilling } from '@/hooks/useCompanyBilling';
import { Loader2 } from 'lucide-react';

interface CompanyTabProps {
  companyId: string;
}

export function CompanyTab({ companyId }: CompanyTabProps) {
  const { data: company, isLoading: companyLoading } = useCompany(companyId);
  const { data: billing, isLoading: billingLoading } = useCompanyBilling(companyId);
  const updateCompany = useUpdateCompany();
  const upsertBilling = useUpsertCompanyBilling();

  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  
  const [billingName, setBillingName] = useState('');
  const [billingStreet, setBillingStreet] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingCountry, setBillingCountry] = useState('Deutschland');
  const [vatId, setVatId] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('14');

  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setCompanyDomain(company.domain || '');
    }
  }, [company]);

  useEffect(() => {
    if (billing) {
      setBillingName(billing.billing_name || '');
      setBillingStreet(billing.billing_street || '');
      setBillingZip(billing.billing_zip || '');
      setBillingCity(billing.billing_city || '');
      setBillingCountry(billing.billing_country || 'Deutschland');
      setVatId(billing.vat_id || '');
      setTaxNumber(billing.tax_number || '');
      setBillingEmail(billing.billing_email || '');
      setBankName(billing.bank_name || '');
      setIban(billing.iban || '');
      setBic(billing.bic || '');
      setPaymentTerms(String(billing.payment_terms_days || 14));
    }
  }, [billing]);

  const handleSaveCompany = async () => {
    try {
      await updateCompany.mutateAsync({
        id: companyId,
        name: companyName,
        domain: companyDomain || null,
      });
      toast({
        title: 'Gespeichert',
        description: 'Firmendaten wurden aktualisiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Firmendaten konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveBilling = async () => {
    try {
      await upsertBilling.mutateAsync({
        companyId,
        billing: {
          billing_name: billingName || null,
          billing_street: billingStreet || null,
          billing_zip: billingZip || null,
          billing_city: billingCity || null,
          billing_country: billingCountry || null,
          vat_id: vatId || null,
          tax_number: taxNumber || null,
          billing_email: billingEmail || null,
          bank_name: bankName || null,
          iban: iban || null,
          bic: bic || null,
          payment_terms_days: parseInt(paymentTerms) || 14,
        },
      });
      toast({
        title: 'Gespeichert',
        description: 'Rechnungsdaten wurden aktualisiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Rechnungsdaten konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  if (companyLoading || billingLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Company Info */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Firmendaten</CardTitle>
          <CardDescription>
            Grundlegende Informationen zu Ihrer Firma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firmenname *</Label>
              <Input 
                id="companyName"
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyDomain">Website / Domain</Label>
              <Input 
                id="companyDomain"
                value={companyDomain} 
                onChange={(e) => setCompanyDomain(e.target.value)}
                placeholder="www.beispiel.de"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveCompany}
            disabled={updateCompany.isPending || !companyName.trim()}
          >
            {updateCompany.isPending ? 'Wird gespeichert...' : 'Firmendaten speichern'}
          </Button>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Rechnungsadresse</CardTitle>
          <CardDescription>
            Diese Adresse wird für alle Rechnungen verwendet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingName">Rechnungsempfänger / Firmenname</Label>
            <Input 
              id="billingName"
              value={billingName} 
              onChange={(e) => setBillingName(e.target.value)}
              placeholder="Muster GmbH"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingStreet">Straße und Hausnummer</Label>
            <Input 
              id="billingStreet"
              value={billingStreet} 
              onChange={(e) => setBillingStreet(e.target.value)}
              placeholder="Musterstraße 123"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingZip">PLZ</Label>
              <Input 
                id="billingZip"
                value={billingZip} 
                onChange={(e) => setBillingZip(e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="billingCity">Stadt</Label>
              <Input 
                id="billingCity"
                value={billingCity} 
                onChange={(e) => setBillingCity(e.target.value)}
                placeholder="Musterstadt"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingCountry">Land</Label>
            <Select value={billingCountry} onValueChange={setBillingCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Deutschland">Deutschland</SelectItem>
                <SelectItem value="Österreich">Österreich</SelectItem>
                <SelectItem value="Schweiz">Schweiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vatId">USt-IdNr.</Label>
              <Input 
                id="vatId"
                value={vatId} 
                onChange={(e) => setVatId(e.target.value)}
                placeholder="DE123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNumber">Steuernummer</Label>
              <Input 
                id="taxNumber"
                value={taxNumber} 
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="123/456/78901"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingEmail">Separate Rechnungs-E-Mail</Label>
            <Input 
              id="billingEmail"
              type="email"
              value={billingEmail} 
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="buchhaltung@firma.de"
            />
            <p className="text-xs text-muted-foreground">
              Rechnungen werden an diese E-Mail-Adresse gesendet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Bankverbindung</CardTitle>
          <CardDescription>
            Für Lastschrift und Überweisungen (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank</Label>
            <Input 
              id="bankName"
              value={bankName} 
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Sparkasse Musterstadt"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input 
                id="iban"
                value={iban} 
                onChange={(e) => setIban(e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bic">BIC</Label>
              <Input 
                id="bic"
                value={bic} 
                onChange={(e) => setBic(e.target.value)}
                placeholder="COBADEFFXXX"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Zahlungsziel (Tage)</Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Tage</SelectItem>
                <SelectItem value="14">14 Tage</SelectItem>
                <SelectItem value="30">30 Tage</SelectItem>
                <SelectItem value="45">45 Tage</SelectItem>
                <SelectItem value="60">60 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSaveBilling}
            disabled={upsertBilling.isPending}
          >
            {upsertBilling.isPending ? 'Wird gespeichert...' : 'Rechnungsdaten speichern'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
