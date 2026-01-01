import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, DollarSign, Trash2, Download, Info, Edit2, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrency, Currency } from '@/hooks/useCurrency';
import { useTransactions } from '@/hooks/useTransactions';
import { useProfile } from '@/hooks/useProfile';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: '$', label: 'US Dollar', symbol: '$' },
  { value: '€', label: 'Euro', symbol: '€' },
  { value: '£', label: 'British Pound', symbol: '£' },
  { value: '₹', label: 'Indian Rupee', symbol: '₹' },
];

export default function Profile() {
  const { currency, setCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { profile, updateProfile } = useProfile();
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: profile.name,
    age: profile.age?.toString() || '',
    gender: profile.gender || '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(profile.profilePicture);

  // Sync form data when dialog opens or profile changes
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditFormData({
        name: profile.name,
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
      });
      setProfileImagePreview(profile.profilePicture);
    }
  }, [isEditDialogOpen, profile]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setProfileImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editFormData.name || 'SmartSpend User',
      age: editFormData.age ? parseInt(editFormData.age) : null,
      gender: (editFormData.gender as any) || null,
      profilePicture: profileImagePreview,
    });
    setIsEditDialogOpen(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully',
    });
  };

  const handleClearData = () => {
    localStorage.removeItem('smartspend_transactions');
    localStorage.removeItem('smartspend_budgets');
    localStorage.removeItem('smartspend_notifications');
    localStorage.removeItem('smartspend_user_profile');
    localStorage.setItem('smartspend_data_cleared', 'true');
    toast({
      title: 'Data cleared',
      description: 'All your transactions, budgets, notifications, and profile data have been deleted',
    });
    window.location.reload();
  };

  const handleExportData = () => {
    const exportDate = new Date().toISOString();
    const dateForFilename = exportDate.split('T')[0];
    
    // Calculate totals
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalInvestment = transactions
      .filter(t => t.category === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Create text content
    let textContent = `SMARTSPEND DATA EXPORT\n`;
    textContent += `Exported: ${exportDate}\n`;
    textContent += `===============================================\n\n`;
    
    textContent += `SUMMARY\n`;
    textContent += `-----------------------------------------------\n`;
    textContent += `Total Transactions: ${transactions.length}\n`;
    textContent += `Total Expense: ${currency}${totalExpense.toFixed(2)}\n`;
    textContent += `Total Investment: ${currency}${totalInvestment.toFixed(2)}\n\n`;
    
    textContent += `TRANSACTIONS (${transactions.length} total)\n`;
    textContent += `-----------------------------------------------\n`;
    
    if (transactions.length === 0) {
      textContent += `No transactions recorded.\n`;
    } else {
      transactions.forEach((transaction, index) => {
        textContent += `\n${index + 1}. ${transaction.notes || transaction.category}\n`;
        textContent += `   Amount: ${currency}${transaction.amount}\n`;
        textContent += `   Category: ${transaction.category}\n`;
        textContent += `   Date: ${transaction.date}\n`;
        textContent += `   Type: ${transaction.type}\n`;
      });
    }
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartspend-export-${dateForFilename}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export complete',
      description: 'Your data has been downloaded as text file',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-transparent backdrop-blur-lg border-b border-border/0">
        <div className="container max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="finance-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                {profile.age && profile.gender && (
                  <p className="text-sm text-muted-foreground">
                    {profile.age} years • {profile.gender}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {transactions.length} transactions recorded
                </p>
              </div>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Edit2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                        {profileImagePreview ? (
                          <img 
                            src={profileImagePreview} 
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>Choose Image</span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={editFormData.age}
                      onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                      placeholder="Enter your age"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={editFormData.gender}
                      onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full"
                  >
                    Save Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Preferences
          </h3>

          {/* Theme Toggle */}
          <div className="finance-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {isDark ? 'Currently enabled' : 'Currently disabled'}
                </p>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>

          {/* Currency Selection */}
          <div className="finance-card">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Currency</p>
                <p className="text-sm text-muted-foreground">
                  Select your preferred currency
                </p>
              </div>
            </div>
            <TooltipProvider>
              <div className="grid grid-cols-4 gap-2">
                {currencies.map((curr) => (
                  <Tooltip key={curr.value}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrency(curr.value)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                          currency === curr.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <span className="text-xl font-semibold">{curr.symbol}</span>
                        <span className="text-xs text-muted-foreground">{curr.value}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{curr.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </motion.section>

        {/* Data Management */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Data Management
          </h3>

          {/* Export Data */}
          <button
            onClick={handleExportData}
            className="finance-card flex items-center gap-3 w-full text-left hover:bg-secondary/50 transition-colors"
          >
            <Download className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download your data as text file
              </p>
            </div>
          </button>

          {/* Clear Data */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="finance-card flex items-center gap-3 w-full text-left hover:bg-destructive/5 transition-colors">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Clear All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Delete all transactions and budgets
                  </p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your transactions and budget data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            About
          </h3>

          <div className="finance-card flex items-center gap-3">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">SmartSpend</p>
              <p className="text-sm text-muted-foreground">
                Version 1.0.0 • Made with ❤️ By Tridip
              </p>
            </div>
          </div>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
