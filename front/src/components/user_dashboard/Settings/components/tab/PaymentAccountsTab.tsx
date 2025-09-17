import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CreditCard, Trash2, Edit3, DollarSign, Banknote, Smartphone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentAccount {
  id: string;
  type: 'paypal' | 'stripe' | 'bank' | 'gcash' | 'payoneer' | 'card';
  name: string;
  accountInfo: string;
  maskedInfo: string;
  isDefault: boolean;
  status: 'verified' | 'pending' | 'not_verified';
  dateAdded: string;
}

const PaymentAccountsTab = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([
    {
      id: '1',
      type: 'paypal',
      name: 'Personal PayPal',
      accountInfo: 'jamaicaanuba3@gmail.com',
      maskedInfo: 'jamaicaanuba3@gmail.com',
      isDefault: true,
      status: 'verified',
      dateAdded: '2024-01-15'
    },
    {
      id: '2',
      type: 'bank',
      name: 'Wells Fargo Checking',
      accountInfo: '1234567890123456',
      maskedInfo: '**** 3456',
      isDefault: false,
      status: 'verified',
      dateAdded: '2024-02-10'
    },
    {
      id: '3',
      type: 'gcash',
      name: 'GCash Mobile Wallet',
      accountInfo: '09123456789',
      maskedInfo: '09*******89',
      isDefault: false,
      status: 'verified',
      dateAdded: '2024-02-15'
    },
    {
      id: '4',
      type: 'card',
      name: 'Visa Credit Card',
      accountInfo: '4532123456789012',
      maskedInfo: '**** **** **** 9012',
      isDefault: false,
      status: 'verified',
      dateAdded: '2024-03-01'
    },
    {
      id: '5',
      type: 'payoneer',
      name: 'Payoneer Business',
      accountInfo: 'business@example.com',
      maskedInfo: 'business@example.com',
      isDefault: false,
      status: 'pending',
      dateAdded: '2024-03-10'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [newAccount, setNewAccount] = useState({
    type: 'paypal' as PaymentAccount['type'],
    name: '',
    accountInfo: '',
    isDefault: false,
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: ''
    }
  });
  const [editAccount, setEditAccount] = useState({
    type: 'paypal' as PaymentAccount['type'],
    name: '',
    accountInfo: '',
    isDefault: false
  });

  const paymentMethodIcons = {
    paypal: <DollarSign className="w-5 h-5" />,
    stripe: <CreditCard className="w-5 h-5" />,
    bank: <Banknote className="w-5 h-5" />,
    gcash: <Smartphone className="w-5 h-5" />,
    payoneer: <DollarSign className="w-5 h-5" />,
    card: <CreditCard className="w-5 h-5" />
  };

  const getStatusColor = (status: PaymentAccount['status']) => {
    switch (status) {
      case 'verified': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'not_verified': return 'bg-destructive text-destructive-foreground';
    }
  };

  const maskAccountInfo = (info: string, type: PaymentAccount['type']) => {
    switch (type) {
      case 'paypal':
        return info; // Show full email for PayPal
      case 'bank':
        return `**** ${info.slice(-4)}`;
      case 'gcash':
        const start = info.slice(0, 2);
        const end = info.slice(-2);
        return `${start}*******${end}`;
      case 'card':
        return `**** **** **** ${info.slice(-4)}`;
      default:
        return info;
    }
  };

  const handleAddOrUpdateAccount = () => {
    // Validation for card type
    if (newAccount.type === 'card') {
      if (!newAccount.name || !newAccount.cardDetails.cardNumber || !newAccount.cardDetails.expiryDate || !newAccount.cardDetails.cvv || !newAccount.cardDetails.cardholderName) {
        toast({
          title: "Error",
          description: "Please fill in all required card fields",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!newAccount.name || !newAccount.accountInfo) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }

    const accountInfo = newAccount.type === 'card' ? newAccount.cardDetails.cardNumber : newAccount.accountInfo;
    
    // If this is set as default, update others
    if (newAccount.isDefault) {
      setAccounts(prev => prev.map(acc => ({ ...acc, isDefault: false })));
    }

    if (editingAccount) {
      // Update existing account
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccount.id 
          ? {
              ...acc,
              type: newAccount.type,
              name: newAccount.name,
              accountInfo: accountInfo,
              maskedInfo: maskAccountInfo(accountInfo, newAccount.type),
              isDefault: newAccount.isDefault,
              status: accountInfo !== editingAccount.accountInfo ? 'pending' : acc.status
            }
          : acc
      ));
      
      toast({
        title: "Success",
        description: "Payment account updated successfully",
        variant: "default"
      });
    } else {
      // Add new account
      const account: PaymentAccount = {
        id: Date.now().toString(),
        type: newAccount.type,
        name: newAccount.name,
        accountInfo: accountInfo,
        maskedInfo: maskAccountInfo(accountInfo, newAccount.type),
        isDefault: newAccount.isDefault,
        status: 'pending',
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setAccounts(prev => [...prev, account]);
      
      toast({
        title: "Success",
        description: "Payment account added successfully. Verification pending.",
        variant: "default"
      });
    }

    // Reset form
    setEditingAccount(null);
    setNewAccount({
      type: 'paypal',
      name: '',
      accountInfo: '',
      isDefault: false,
      cardDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      bankDetails: {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: ''
      }
    });
    setShowAddForm(false);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    toast({
      title: "Account Deleted",
      description: "Payment account has been removed",
      variant: "default"
    });
  };

  const handleSetDefault = (id: string) => {
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })));
    toast({
      title: "Default Updated",
      description: "Default payment account has been changed",
      variant: "default"
    });
  };

  const handleEditAccount = (account: PaymentAccount) => {
    setEditingAccount(account);
    
    // Pre-populate the add form with existing account data
    setNewAccount({
      type: account.type,
      name: account.name,
      accountInfo: account.accountInfo,
      isDefault: account.isDefault,
      cardDetails: {
        cardNumber: account.type === 'card' ? account.accountInfo : '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      bankDetails: {
        bankName: '',
        accountNumber: account.type === 'bank' ? account.accountInfo : '',
        routingNumber: '',
        swiftCode: ''
      }
    });
    
    // Show the add form instead of edit form
    setShowAddForm(true);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !editAccount.name || !editAccount.accountInfo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // If this is set as default, update others
    if (editAccount.isDefault && !editingAccount.isDefault) {
      setAccounts(prev => prev.map(acc => ({ ...acc, isDefault: false })));
    }

    setAccounts(prev => prev.map(acc => 
      acc.id === editingAccount.id 
        ? {
            ...acc,
            ...editAccount,
            maskedInfo: maskAccountInfo(editAccount.accountInfo, editAccount.type),
            status: editAccount.accountInfo !== editingAccount.accountInfo ? 'pending' : acc.status
          }
        : acc
    ));

    setEditingAccount(null);
    setEditAccount({
      type: 'paypal',
      name: '',
      accountInfo: '',
      isDefault: false
    });
    setShowEditForm(false);
    
    toast({
      title: "Success",
      description: "Payment account updated successfully",
      variant: "default"
    });
  };

  const getAccountPlaceholder = (type: PaymentAccount['type']) => {
    switch (type) {
      case 'paypal': return 'your-email@domain.com';
      case 'stripe': return 'Connect via OAuth (handled automatically)';
      case 'bank': return 'Account Number or IBAN';
      case 'gcash': return 'Registered mobile number (09XXXXXXXXX)';
      case 'payoneer': return 'Email or Account ID';
      case 'card': return 'Card Number';
    }
  };

  const getProviderName = (type: PaymentAccount['type']) => {
    switch (type) {
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      case 'bank': return 'Bank Transfer';
      case 'gcash': return 'GCash';
      case 'payoneer': return 'Payoneer';
      case 'card': return 'Credit/Debit Card';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">My Payment Accounts</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Set up and manage your payout accounts. Donations, bids, and purchases will be sent directly to your preferred account.
          </p>
        </div>
        <Dialog open={showAddForm} onOpenChange={(open) => {
          setShowAddForm(open);
          if (!open) {
            // Reset form when closing
            setEditingAccount(null);
            setNewAccount({
              type: 'paypal',
              name: '',
              accountInfo: '',
              isDefault: false,
              cardDetails: {
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                cardholderName: ''
              },
              bankDetails: {
                bankName: '',
                accountNumber: '',
                routingNumber: '',
                swiftCode: ''
              }
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-[11px] rounded-full bg-red-800">
              <Plus className="w-2 h-2" />
              Add New Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Update your payment account details' : 'Connect a new payment account to receive funds'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Provider</Label>
                <Select value={newAccount.type} onValueChange={(value) => 
                  setNewAccount(prev => ({ ...prev, type: value as PaymentAccount['type'] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="payoneer">Payoneer</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Personal PayPal, Primary Bank"
                />
              </div>

              {newAccount.type === 'card' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={newAccount.cardDetails.cardholderName}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cardholderName: e.target.value } }))}
                      placeholder="Full name as on card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={newAccount.cardDetails.cardNumber}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cardNumber: e.target.value } }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={newAccount.cardDetails.expiryDate}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, expiryDate: e.target.value } }))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={newAccount.cardDetails.cvv}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, cardDetails: { ...prev.cardDetails, cvv: e.target.value } }))}
                        placeholder="123"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              ) : newAccount.type === 'paypal' ? (
                <div className="space-y-2">
                  <Label htmlFor="accountInfo">PayPal Email Address</Label>
                  <Input
                    id="accountInfo"
                    type="email"
                    value={newAccount.accountInfo}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountInfo: e.target.value }))}
                    placeholder="your-email@domain.com"
                  />
                </div>
              ) : newAccount.type === 'bank' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={newAccount.bankDetails.bankName}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value } }))}
                      placeholder="e.g., Wells Fargo, Chase Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={newAccount.bankDetails.accountNumber}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }, accountInfo: e.target.value }))}
                      placeholder="Account Number or IBAN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
                    <Input
                      id="routingNumber"
                      value={newAccount.bankDetails.routingNumber}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, routingNumber: e.target.value } }))}
                      placeholder="9-digit routing number"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">SWIFT/BIC Code (Optional)</Label>
                    <Input
                      id="swiftCode"
                      value={newAccount.bankDetails.swiftCode}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, swiftCode: e.target.value } }))}
                      placeholder="For international transfers"
                    />
                  </div>
                </div>
              ) : newAccount.type === 'gcash' ? (
                <div className="space-y-2">
                  <Label htmlFor="accountInfo">Registered Mobile Number</Label>
                  <Input
                    id="accountInfo"
                    value={newAccount.accountInfo}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountInfo: e.target.value }))}
                    placeholder="09XXXXXXXXX"
                    pattern="[0-9]{11}"
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the mobile number registered with your GCash account
                  </p>
                </div>
              ) : newAccount.type === 'payoneer' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payoneerEmail">Payoneer Email</Label>
                    <Input
                      id="payoneerEmail"
                      type="email"
                      value={newAccount.accountInfo}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, accountInfo: e.target.value }))}
                      placeholder="your-payoneer-email@domain.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payoneerAccountId">Account ID (Optional)</Label>
                    <Input
                      id="payoneerAccountId"
                      placeholder="Payoneer Account ID"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="accountInfo">Account Information</Label>
                  <Input
                    id="accountInfo"
                    value={newAccount.accountInfo}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountInfo: e.target.value }))}
                    placeholder={getAccountPlaceholder(newAccount.type)}
                    disabled={newAccount.type === 'stripe'}
                  />
                  {newAccount.type === 'stripe' && (
                    <p className="text-xs text-muted-foreground">
                      Stripe requires OAuth connection. This will redirect you to Stripe to link your account.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={newAccount.isDefault}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-border"
                />
                <Label htmlFor="default" className="text-sm">Set as default payment method</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddOrUpdateAccount} className="flex-1">
                  {editingAccount ? 'Update Account' : (newAccount.type === 'stripe' ? 'Connect Stripe' : 'Add Account')}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Payment Method</DialogTitle>
              <DialogDescription>
                Update your payment account details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Payment Provider</Label>
                <Select value={editAccount.type} onValueChange={(value) => 
                  setEditAccount(prev => ({ ...prev, type: value as PaymentAccount['type'] }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="payoneer">Payoneer</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Personal PayPal, Primary Bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-accountInfo">Account Information</Label>
                <Input
                  id="edit-accountInfo"
                  value={editAccount.accountInfo}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, accountInfo: e.target.value }))}
                  placeholder={getAccountPlaceholder(editAccount.type)}
                  disabled={editAccount.type === 'stripe'}
                />
                {editAccount.type === 'stripe' && (
                  <p className="text-xs text-muted-foreground">
                    Stripe requires OAuth connection. This will redirect you to Stripe to link your account.
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-default"
                  checked={editAccount.isDefault}
                  onChange={(e) => setEditAccount(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-border"
                />
                <Label htmlFor="edit-default" className="text-sm">Set as default payment method</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateAccount} className="flex-1">
                  Update Account
                </Button>
                <Button variant="outline" onClick={() => setShowEditForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Method</TableHead>
                <TableHead>Account Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        {paymentMethodIcons[account.type]}
                      </div>
                      <span className="font-medium">{getProviderName(account.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{account.maskedInfo}</div>
                      <div className="text-xs text-muted-foreground">{account.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(account.status)}>
                      {account.status === 'verified' ? 'Verified' : 
                       account.status === 'pending' ? 'Pending' : 'Not Verified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.isDefault ? (
                      <Badge variant="secondary" className="bg-success-muted text-success">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!account.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(account.id)}
                          className="text-xs"
                        >
                          Set as Default
                        </Button>
                      )}
                      {account.status !== 'verified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Verify
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Payment Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{account.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAccount(account.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Security & Notifications</h4>
              <p className="text-sm text-muted-foreground">
                For security, we recommend enabling 2FA in your account settings when managing payment methods.
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive email/SMS notifications when: a new payment method is added, default account is changed, or an account is removed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAccountsTab;