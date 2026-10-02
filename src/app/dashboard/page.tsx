'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import {
  CreditCard,
  Send,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  ArrowDownToLine,
  FileText,
  PieChart,
  Lock,
  Smartphone,
  Monitor,
  Zap,
  Wifi,
  Droplets,
  Building,
  Eye,
  EyeOff,
  Download,
  Printer,
  TrendingUp,
  PiggyBank,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Receipt,
  X,
  Snowflake,
  Mail,
  Phone,
} from 'lucide-react';
import NovaLogo from '@/components/NovaLogo';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

interface Account {
  id: string;
  accountNumber: string;
  iban: string;
  accountType: string;
  currency: string;
  balance: string | number;
  dailyTransferLimit: string | number;
  status: string;
}

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: string | number;
  fee?: string | number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  sourceAccount?: {
    accountNumber: string;
    user: { firstName: string; lastName: string };
  };
  destinationAccount?: {
    accountNumber: string;
    user: { firstName: string; lastName: string };
  };
}

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  nickname?: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface Vault {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cards' | 'transfers' | 'bills' | 'vaults' | 'analytics' | 'security' | 'profile'
  >('overview');

  // Core Data
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Responsive & Mobile App Mode State
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [appModeSimulated, setAppModeSimulated] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [txFilter, setTxFilter] = useState<'ALL' | 'SENT' | 'RECEIVED' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isAddBeneficiaryModalOpen, setIsAddBeneficiaryModalOpen] = useState(false);
  const [selectedTxReceipt, setSelectedTxReceipt] = useState<Transaction | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState('Current Month');

  // Transfer state
  const [transferData, setTransferData] = useState({
    recipientAccount: '',
    amount: '',
    description: '',
    pin: '',
    saveBeneficiary: false,
    beneficiaryName: '',
  });
  const [recipientLookup, setRecipientLookup] = useState<any>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Deposit & Withdraw state
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // New Account Creation Form
  const [newAccountType, setNewAccountType] = useState<'SAVINGS' | 'BUSINESS'>('SAVINGS');
  const [newAccountDeposit, setNewAccountDeposit] = useState('100');
  const [newAccountLoading, setNewAccountLoading] = useState(false);

  // Beneficiary form
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    accountNumber: '',
    nickname: '',
  });
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(false);

  // Bill payment state
  const [billCategory, setBillCategory] = useState<'electricity' | 'internet' | 'water' | 'mobile' | 'creditCard'>('electricity');
  const [billerName, setBillerName] = useState('Zoorich Power & Electric');
  const [billAccountNo, setBillAccountNo] = useState('');
  const [billAmount, setBillAmount] = useState('85.50');
  const [billPin, setBillPin] = useState('');
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState<string | null>(null);
  const [billReceipt, setBillReceipt] = useState<any | null>(null);

  // Virtual Card State
  const [revealCardDetails, setRevealCardDetails] = useState(false);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [onlinePurchases, setOnlinePurchases] = useState(true);
  const [intlRoaming, setIntlRoaming] = useState(false);
  const [atmDailyLimit, setAtmDailyLimit] = useState(1500);
  const [cardLastDigits, setCardLastDigits] = useState('9812');

  // Vaults State
  const [vaults, setVaults] = useState<Vault[]>([
    { id: '1', name: 'Emergency Reserve', targetAmount: 5000, currentAmount: 1250, icon: '🛡️' },
    { id: '2', name: 'Tokyo Vacation', targetAmount: 3500, currentAmount: 1850, icon: '✈️' },
    { id: '3', name: 'Tech & Hardware', targetAmount: 2000, currentAmount: 1400, icon: '💻' },
  ]);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [vaultActionModal, setVaultActionModal] = useState<{ vault: Vault; type: 'deposit' | 'withdraw' } | null>(null);
  const [vaultActionAmount, setVaultActionAmount] = useState('100');
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('1000');
  const [newVaultIcon, setNewVaultIcon] = useState('🎯');

  // Security / PIN / 2FA State
  const [currentPasswordForPin, setCurrentPasswordForPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeLoading, setPinChangeLoading] = useState(false);
  const [pinChangeMessage, setPinChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Profile Edit State
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // 2FA state
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);

  // Load Initial Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, accountsRes, txRes] = await Promise.all([
        ApiClient.get('/auth/profile'),
        ApiClient.get('/accounts'),
        ApiClient.get('/accounts/transactions?limit=50'),
      ]);

      setUser(profileRes.data);
      setProfileFirstName(profileRes.data?.firstName || '');
      setProfileLastName(profileRes.data?.lastName || '');
      setProfilePhone(profileRes.data?.phone || '');
      const accList: Account[] = accountsRes.data.accounts || [];
      setAccounts(accList);
      setSelectedAccount((prev) => {
        if (!prev && accList.length > 0) return accList[0];
        if (prev) {
          const refreshed = accList.find((a) => a.id === prev.id);
          return refreshed || accList[0] || null;
        }
        return null;
      });
      setTransactions(txRes.data.transactions || []);
    } catch (err: any) {
      if (err.message && (err.message.includes('token') || err.message.includes('401'))) {
        localStorage.removeItem('zoorich_token');
        localStorage.removeItem('zoorich_user');
        localStorage.removeItem('nova_token');
        localStorage.removeItem('apex_token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch Beneficiaries
  const fetchBeneficiaries = useCallback(async () => {
    try {
      const res = await ApiClient.get('/accounts/beneficiaries');
      setBeneficiaries(res.data || []);
    } catch {
      // Graceful fallback
    }
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await ApiClient.get('/accounts/audit-logs');
      setAuditLogs(res.data || []);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('zoorich_token') || localStorage.getItem('nova_token') || localStorage.getItem('apex_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
    fetchBeneficiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs]);

  // Recipient live lookup
  useEffect(() => {
    const query = transferData.recipientAccount.trim();
    if (query.length >= 8) {
      const timer = setTimeout(async () => {
        try {
          const res = await ApiClient.get(`/accounts/lookup/${query}`);
          setRecipientLookup(res.data);
        } catch {
          setRecipientLookup(null);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setRecipientLookup(null);
    }
  }, [transferData.recipientAccount]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('zoorich_token');
    localStorage.removeItem('zoorich_user');
    localStorage.removeItem('nova_token');
    localStorage.removeItem('apex_token');
    localStorage.removeItem('nova_user');
    localStorage.removeItem('apex_user');
    router.push('/login');
  };

  // Execute Transfer
  const executeTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setTransferError(null);
    setTransferSuccess(null);

    const targetAcc = transferData.recipientAccount.trim();
    if (targetAcc === selectedAccount.accountNumber) {
      setTransferError('Cannot transfer to the same account. Please enter another account number.');
      return;
    }

    setTransferLoading(true);

    try {
      const res = await ApiClient.post(
        '/transfers/send',
        {
          sourceAccountId: selectedAccount.id,
          destinationAccountNumber: targetAcc,
          amount: parseFloat(transferData.amount),
          description: transferData.description || 'P2P Transfer',
          transactionPin: transferData.pin,
        },
        true
      );

      setTransferSuccess(
        `Sent $${parseFloat(transferData.amount).toFixed(2)} to ${res.data?.recipientName || 'recipient'}`
      );

      // Optionally save to beneficiaries
      if (transferData.saveBeneficiary && res.data?.recipientName) {
        try {
          await ApiClient.post('/accounts/beneficiaries', {
            name: res.data.recipientName,
            accountNumber: targetAcc,
            nickname: transferData.beneficiaryName || 'Saved Payee',
          });
          fetchBeneficiaries();
        } catch { }
      }

      setTransferData({
        recipientAccount: '',
        amount: '',
        description: '',
        pin: '',
        saveBeneficiary: false,
        beneficiaryName: '',
      });
      setRecipientLookup(null);
      fetchDashboardData();

      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferSuccess(null);
      }, 1500);
    } catch (err: any) {
      setTransferError(err.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  // Execute Deposit
  const executeDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setDepositLoading(true);

    try {
      await ApiClient.post(
        '/transfers/deposit',
        {
          accountId: selectedAccount.id,
          amount: parseFloat(depositAmount),
          description: 'Cash Deposit',
        },
        true
      );
      setIsDepositModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  // Execute Withdrawal with Balance Verification
  const executeWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setWithdrawError(null);

    const amountNum = parseFloat(withdrawAmount);
    const currentBal = Number(selectedAccount.balance);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    if (amountNum > currentBal) {
      setWithdrawError(
        `Insufficient funds. Your available balance is $${currentBal.toLocaleString('en-US', {
          minimumFractionDigits: 2,
        })} USD.`
      );
      return;
    }

    setWithdrawLoading(true);

    try {
      await ApiClient.post(
        '/transfers/withdraw',
        {
          accountId: selectedAccount.id,
          amount: amountNum,
          description: 'ATM Cash Withdrawal',
          transactionPin: withdrawPin,
        },
        true
      );
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawPin('');
      fetchDashboardData();
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Open New Account
  const handleCreateNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAccountLoading(true);
    try {
      await ApiClient.post('/accounts/create', {
        accountType: newAccountType,
        currency: 'USD',
        initialDeposit: parseFloat(newAccountDeposit) || 0,
      });
      setIsNewAccountModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    } finally {
      setNewAccountLoading(false);
    }
  };

  // Beneficiary Management
  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setBeneficiaryLoading(true);
    try {
      await ApiClient.post('/accounts/beneficiaries', {
        name: beneficiaryForm.name,
        accountNumber: beneficiaryForm.accountNumber,
        nickname: beneficiaryForm.nickname || undefined,
      });
      setIsAddBeneficiaryModalOpen(false);
      setBeneficiaryForm({ name: '', accountNumber: '', nickname: '' });
      fetchBeneficiaries();
    } catch (err: any) {
      alert(err.message || 'Failed to add beneficiary');
    } finally {
      setBeneficiaryLoading(false);
    }
  };

  const handleDeleteBeneficiary = async (id: string) => {
    if (!confirm('Are you sure you want to remove this payee?')) return;
    try {
      await ApiClient.request(`/accounts/beneficiaries/${id}`, { method: 'DELETE' });
      fetchBeneficiaries();
    } catch (err: any) {
      alert(err.message || 'Failed to remove payee');
    }
  };

  // Quick Pay to Beneficiary
  const quickPayBeneficiary = (b: Beneficiary) => {
    setTransferData({
      recipientAccount: b.accountNumber,
      amount: '50',
      description: `Payment to ${b.name}`,
      pin: '',
      saveBeneficiary: false,
      beneficiaryName: '',
    });
    setTransferError(null);
    setTransferSuccess(null);
    setIsTransferModalOpen(true);
  };

  // Execute Bill Payment
  const executeBillPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setBillError(null);
    setBillLoading(true);

    try {
      const desc = `Bill Payment: ${billerName} (Ref #${billAccountNo || Math.floor(100000 + Math.random() * 900000)})`;
      await ApiClient.post(
        '/transfers/withdraw',
        {
          accountId: selectedAccount.id,
          amount: parseFloat(billAmount),
          description: desc,
          transactionPin: billPin,
        },
        true
      );

      const receipt = {
        receiptNumber: `RCP-${Date.now().toString().slice(-8)}`,
        billerName,
        category: billCategory,
        accountNo: billAccountNo || 'Auto-Resolved',
        amount: parseFloat(billAmount),
        paidFrom: selectedAccount.accountNumber,
        timestamp: new Date().toISOString(),
        status: 'PAID & SETTLED',
      };

      setBillReceipt(receipt);
      setBillPin('');
      setBillAccountNo('');
      fetchDashboardData();
    } catch (err: any) {
      setBillError(err.message || 'Bill payment failed');
    } finally {
      setBillLoading(false);
    }
  };

  // Vault Management
  const handleVaultAction = () => {
    if (!vaultActionModal || !selectedAccount) return;
    const amount = parseFloat(vaultActionAmount);
    if (!amount || amount <= 0) return;

    const { vault, type } = vaultActionModal;

    if (type === 'deposit') {
      if (Number(selectedAccount.balance) < amount) {
        alert('Insufficient balance in your checking account');
        return;
      }
      setVaults((prev) =>
        prev.map((v) => (v.id === vault.id ? { ...v, currentAmount: v.currentAmount + amount } : v))
      );
    } else {
      if (vault.currentAmount < amount) {
        alert('Amount exceeds vault balance');
        return;
      }
      setVaults((prev) =>
        prev.map((v) => (v.id === vault.id ? { ...v, currentAmount: v.currentAmount - amount } : v))
      );
    }
    setVaultActionModal(null);
    setVaultActionAmount('100');
  };

  const handleCreateVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName) return;
    const newV: Vault = {
      id: Date.now().toString(),
      name: newVaultName,
      targetAmount: parseFloat(newVaultTarget) || 1000,
      currentAmount: 0,
      icon: newVaultIcon || '🎯',
    };
    setVaults((prev) => [...prev, newV]);
    setIsVaultModalOpen(false);
    setNewVaultName('');
    setNewVaultTarget('1000');
  };

  // Setup / Change PIN
  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setPinChangeMessage({ type: 'error', text: 'New PINs do not match' });
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setPinChangeMessage({ type: 'error', text: 'PIN must be exactly 6 numeric digits' });
      return;
    }

    setPinChangeLoading(true);
    setPinChangeMessage(null);
    try {
      await ApiClient.post('/auth/pin/setup', {
        password: currentPasswordForPin,
        pin: newPin,
      });
      setPinChangeMessage({ type: 'success', text: 'Transaction PIN updated successfully' });
      setCurrentPasswordForPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinChangeMessage({ type: 'error', text: err.message || 'Failed to update PIN' });
    } finally {
      setPinChangeLoading(false);
    }
  };

  // 2FA Setup
  const handleGenerate2FA = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMessage(null);
    try {
      const res = await ApiClient.post('/auth/2fa/generate', {});
      setTwoFactorData(res.data);
    } catch (err: any) {
      setTwoFactorMessage(err.message || 'Failed to generate 2FA secret');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorLoading(true);
    try {
      await ApiClient.post('/auth/2fa/verify', { token: twoFactorCode });
      setTwoFactorMessage('Two-Factor Authentication is now ENABLED!');
      setTwoFactorData(null);
      setTwoFactorCode('');
      fetchDashboardData();
    } catch (err: any) {
      setTwoFactorMessage(err.message || 'Verification failed');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Calculate Inflow & Outflow for Analytics
  const totalInflow = transactions
    .filter((t) => t.type === 'DEPOSIT' || (t.destinationAccount?.accountNumber === selectedAccount?.accountNumber))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = transactions
    .filter((t) => t.type === 'WITHDRAWAL' || (t.sourceAccount?.accountNumber === selectedAccount?.accountNumber))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.destinationAccount?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sourceAccount?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (txFilter === 'SENT') {
      return tx.sourceAccount?.accountNumber === selectedAccount?.accountNumber;
    }
    if (txFilter === 'RECEIVED') {
      return tx.destinationAccount?.accountNumber === selectedAccount?.accountNumber && tx.type === 'TRANSFER';
    }
    if (txFilter === 'DEPOSIT') {
      return tx.type === 'DEPOSIT';
    }
    if (txFilter === 'WITHDRAWAL') {
      return tx.type === 'WITHDRAWAL';
    }
    return true;
  });

  if (loading && !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          color: '#ffffff',
        }}
      >
        <RefreshCw className="animate-spin" size={32} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', paddingBottom: '80px' }}>
      {/* Top Header */}
      <header
        className="dashboard-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <NovaLogo size="sm" subtitle="Private Banking" />
        </div>

        {/* User bar & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="header-user-pill"
            style={{
              background: activeTab === 'profile' ? 'rgba(56, 189, 248, 0.15)' : '#141417',
              border: activeTab === 'profile' ? '1px solid #38bdf8' : '1px solid #27272a',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.85rem',
              color: '#ffffff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to view & edit Profile"
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <span className="header-user-fullname">
              {user?.firstName} {user?.lastName}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: activeTab === 'profile' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                color: activeTab === 'profile' ? '#000000' : '#a1a1aa',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              PROFILE
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="btn-secondary header-signout-btn"
            style={{ padding: '8px 12px', fontSize: '0.85rem', flexShrink: 0 }}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span className="header-signout-text">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main
        className={appModeSimulated ? 'simulated-mobile-mode' : ''}
        style={{
          maxWidth: appModeSimulated ? '430px' : '1180px',
          margin: appModeSimulated ? '24px auto 48px' : '24px auto 0',
          padding: appModeSimulated ? '16px 16px 80px' : '0 20px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Phone Speaker Notch & Status Bar when simulated mode is active on desktop */}
        {appModeSimulated && (
          <div
            style={{
              padding: '6px 16px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#a1a1aa',
              borderBottom: '1px solid #1f1f26',
              marginBottom: '16px',
              background: '#0a0a0d',
              borderRadius: '24px 24px 0 0',
            }}
          >
            <span style={{ fontWeight: 700, color: '#ffffff' }}>9:41</span>
            <div style={{ width: '60px', height: '4px', background: '#27272a', borderRadius: '4px' }} />
            <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Wifi size={13} color="#38bdf8" />
              <span style={{ fontWeight: 700, color: '#10b981' }}>5G</span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>100%</span>
            </span>
          </div>
        )}
        {/* Navigation Tabs Bar */}
        <div className="bank-tabs-nav">
          <button
            onClick={() => setActiveTab('overview')}
            className={`bank-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <Building size={16} />
            <span>Accounts & Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`bank-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          >
            <CreditCard size={16} />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`bank-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
          >
            <Send size={16} />
            <span>Transfers & Payees</span>
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`bank-tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          >
            <Receipt size={16} />
            <span>Pay Bills</span>
          </button>
          <button
            onClick={() => setActiveTab('vaults')}
            className={`bank-tab-btn ${activeTab === 'vaults' ? 'active' : ''}`}
          >
            <PiggyBank size={16} />
            <span>Savings Vaults</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`bank-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <PieChart size={16} />
            <span>Analytics & Statements</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`bank-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          >
            <Lock size={16} />
            <span>Security & PIN</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`bank-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <UserCheck size={16} />
            <span>Profile & KYC</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACCOUNTS & OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* Main Balance & Action Grid */}
            <div
              className="responsive-2col-grid"
              style={{
                marginBottom: '28px',
              }}
            >
              {/* Primary Balance Card */}
              <div
                className="clean-card"
                style={{
                  padding: '28px',
                  backgroundColor: '#0d0d10',
                  border: '1px solid #222226',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-pill">{selectedAccount?.accountType || 'CHECKING'} ACCOUNT</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cards')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                      e.currentTarget.style.borderColor = '#38bdf8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    }}
                    title="Click to manage Debit Card & Limits"
                  >
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Active</span>
                    <CreditCard size={18} color="#38bdf8" />
                  </button>
                </div>

                <div style={{ margin: '20px 0 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>Available Balance</span>
                    <button
                      type="button"
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      style={{
                        background: 'transparent',
                        color: isBalanceVisible ? '#a1a1aa' : '#38bdf8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #27272a',
                        transition: 'all 0.15s ease',
                      }}
                      title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
                    >
                      {isBalanceVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isBalanceVisible ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>

                  <div style={{ fontSize: 'clamp(1.9rem, 6.5vw, 2.8rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', marginTop: '4px' }}>
                    {isBalanceVisible ? (
                      <>
                        ${Number(selectedAccount?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span style={{ fontSize: '1rem', color: '#10b981', marginLeft: '8px', fontWeight: 600 }}>
                          {selectedAccount?.currency || 'USD'}
                        </span>
                      </>
                    ) : (
                      <span style={{ letterSpacing: '0.12em', color: '#71717a', fontSize: '2.2rem' }}>••••••••</span>
                    )}
                  </div>
                </div>

                {/* Account Details Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    background: '#16161a',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #26262b',
                  }}
                >
                  <div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.72rem' }}>Account Number</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
                      {selectedAccount?.accountNumber}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.72rem' }}>IBAN / Routing</div>
                    <div
                      style={{
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                      }}
                      onClick={() => handleCopy(selectedAccount?.iban || '')}
                      title="Click to copy IBAN"
                    >
                      <span>{selectedAccount?.iban ? `${selectedAccount.iban.slice(0, 10)}...` : ''}</span>
                      <Copy size={12} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div
                className="clean-card"
                style={{
                  padding: '28px',
                  backgroundColor: '#0d0d10',
                  border: '1px solid #222226',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Financial Actions</h2>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px' }}>
                    Instant transfers, deposits, or utility payments.
                  </p>
                </div>

                <div className="mobile-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '20px 0' }}>
                  <button
                    onClick={() => {
                      setTransferError(null);
                      setIsTransferModalOpen(true);
                    }}
                    className="btn-primary"
                    style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <Send size={18} />
                    <span>Send</span>
                  </button>

                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="btn-emerald"
                    style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <PlusCircle size={18} />
                    <span>Deposit</span>
                  </button>

                  <button
                    onClick={() => {
                      setWithdrawError(null);
                      setIsWithdrawModalOpen(true);
                    }}
                    className="btn-secondary"
                    style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <ArrowDownToLine size={18} />
                    <span>Withdraw</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('bills')}
                    className="btn-secondary"
                    style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}
                  >
                    <Receipt size={18} />
                    <span>Pay Bill</span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#71717a',
                  }}
                >
                  <span>Protected by 6-Digit PIN & Double-Entry Ledger</span>
                  <button
                    onClick={() => setIsStatementModalOpen(true)}
                    style={{ color: '#38bdf8', background: 'transparent', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    e-Statement
                  </button>
                </div>
              </div>
            </div>

            {/* Cash Flow Mini Bar */}
            <div
              className="clean-card"
              style={{
                padding: '16px 20px',
                backgroundColor: '#0d0d10',
                border: '1px solid #222226',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>Monthly Activity:</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Inflow (Credits): </span>
                  <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.92rem' }}>
                    +${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Outflow (Debits): </span>
                  <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.92rem' }}>
                    -${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="clean-card" style={{ padding: '24px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Transaction History</h2>
                  <p style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Click any row to view full transaction receipt</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#71717a" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: '#16161a',
                        border: '1px solid #26262b',
                        borderRadius: '6px',
                        padding: '6px 12px 6px 30px',
                        fontSize: '0.85rem',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  <select
                    value={txFilter}
                    onChange={(e: any) => setTxFilter(e.target.value)}
                    style={{
                      background: '#16161a',
                      border: '1px solid #26262b',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.85rem',
                      color: '#ffffff',
                    }}
                  >
                    <option value="ALL">All Events</option>
                    <option value="SENT">Sent</option>
                    <option value="RECEIVED">Received</option>
                    <option value="DEPOSIT">Deposits</option>
                    <option value="WITHDRAWAL">Withdrawals</option>
                  </select>
                </div>
              </div>

              {/* Table (Desktop View) */}
              <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #26262b', color: '#a1a1aa' }}>
                      <th style={{ padding: '12px 14px' }}>Type</th>
                      <th style={{ padding: '12px 14px' }}>Description / Counterparty</th>
                      <th style={{ padding: '12px 14px' }}>Reference</th>
                      <th style={{ padding: '12px 14px' }}>Date</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#71717a' }}>
                          No transactions found for the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isDebit =
                          tx.sourceAccount?.accountNumber === selectedAccount?.accountNumber ||
                          tx.type === 'WITHDRAWAL';

                        return (
                          <tr
                            key={tx.id}
                            onClick={() => setSelectedTxReceipt(tx)}
                            style={{
                              borderBottom: '1px solid #1a1a20',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#141418')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '14px 14px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: isDebit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                  color: isDebit ? '#ef4444' : '#10b981',
                                }}
                              >
                                {isDebit ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                              </span>
                            </td>

                            <td style={{ padding: '14px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#ffffff' }}>{tx.description}</div>
                              <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
                                {tx.type === 'TRANSFER' && (
                                  <>
                                    {isDebit
                                      ? `To: ${tx.destinationAccount?.user?.firstName || 'User'} (${tx.destinationAccount?.accountNumber})`
                                      : `From: ${tx.sourceAccount?.user?.firstName || 'User'} (${tx.sourceAccount?.accountNumber})`}
                                  </>
                                )}
                              </div>
                            </td>

                            <td style={{ padding: '14px 14px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#a1a1aa' }}>
                              {tx.reference}
                            </td>

                            <td style={{ padding: '14px 14px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                              {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            <td style={{ padding: '14px 14px' }}>
                              <span className="badge badge-success">COMPLETED</span>
                            </td>

                            <td
                              style={{
                                padding: '14px 14px',
                                textAlign: 'right',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                color: isDebit ? '#ffffff' : '#10b981',
                              }}
                            >
                              {isDebit ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Feed */}
              <div className="mobile-tx-list-view">
                {filteredTransactions.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#71717a', fontSize: '0.88rem' }}>
                    No transactions found for the selected filter.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isDebit =
                      tx.sourceAccount?.accountNumber === selectedAccount?.accountNumber ||
                      tx.type === 'WITHDRAWAL';
                    return (
                      <div
                        key={tx.id}
                        className="mobile-tx-card"
                        onClick={() => setSelectedTxReceipt(tx)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: isDebit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: isDebit ? '#ef4444' : '#10b981',
                              flexShrink: 0,
                            }}
                          >
                            {isDebit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem', lineHeight: 1.3 }}>
                              {tx.description}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '3px' }}>
                              {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: isDebit ? '#ffffff' : '#10b981',
                            }}
                          >
                            {isDebit ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>COMPLETED</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CARDS (VIRTUAL & PHYSICAL DEBIT CARD) */}
        {/* ========================================================= */}
        {activeTab === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {/* Left: 3D Realistic Debit Card */}
            <div>
              <div
                className="debit-card-surface"
                style={{
                  padding: '30px',
                  minHeight: '230px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                  position: 'relative',
                }}
              >
                {/* Frozen Overlay */}
                {cardFrozen && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      zIndex: 10,
                      borderRadius: '18px',
                      color: '#38bdf8',
                    }}
                  >
                    <Snowflake size={36} className="animate-pulse" />
                    <span style={{ fontWeight: 800, letterSpacing: '0.1em' }}>CARD FROZEN</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>All transactions temporarily blocked</span>
                  </div>
                )}

                {/* Card Top: Zoorich Logo & Contactless */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <NovaLogo size="sm" subtitle="Zoorich Platinum" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wifi size={22} color="#94a3b8" style={{ transform: 'rotate(90deg)' }} />
                    <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 800, letterSpacing: '0.08em' }}>
                      ZOORICH BLACK
                    </span>
                  </div>
                </div>

                {/* EMV Chip Graphic */}
                <div style={{ margin: '18px 0 10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)',
                      border: '1px solid #78350f',
                      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                    }}
                  />
                </div>

                {/* 16-Digit Card Number */}
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 'clamp(1.05rem, 4.8vw, 1.35rem)',
                    letterSpacing: 'clamp(0.12em, 2vw, 0.22em)',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '8px 0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {revealCardDetails ? `4532 8920 1198 ${cardLastDigits}` : `4532 •••• •••• ${cardLastDigits}`}
                  <button
                    onClick={() => setRevealCardDetails(!revealCardDetails)}
                    style={{ background: 'transparent', color: '#94a3b8' }}
                    title={revealCardDetails ? 'Hide Details' : 'Show Details'}
                  >
                    {revealCardDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Bottom Card Holder & Expiry */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Cardholder
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', textTransform: 'uppercase' }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase' }}>Expires</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>08/29</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase' }}>CVV</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                        {revealCardDetails ? '842' : '•••'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '1.4rem', color: '#ffffff', opacity: 0.85 }}>
                    VISA
                  </div>
                </div>
              </div>

              {/* Action Pills */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    handleCopy(`453289201198${cardLastDigits}`);
                    alert('Card number copied to clipboard');
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  <Copy size={15} />
                  <span>Copy Number</span>
                </button>

                <button
                  onClick={() => {
                    const newDigits = Math.floor(1000 + Math.random() * 9000).toString();
                    setCardLastDigits(newDigits);
                    alert(`Issued new virtual card ending in ${newDigits}`);
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={15} />
                  <span>Reissue Card</span>
                </button>
              </div>
            </div>

            {/* Right: Card Controls & Security Switches */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                Card Controls & Limits
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Control online spending, international usage, and daily withdrawal limits in real-time.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Freeze Card Switch */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#16161a',
                    borderRadius: '10px',
                    border: '1px solid #26262b',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Freeze Card</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>Instantly block all card transactions</div>
                  </div>
                  <button
                    onClick={() => setCardFrozen(!cardFrozen)}
                    style={{
                      background: cardFrozen ? '#ef4444' : '#27272a',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {cardFrozen ? 'FROZEN' : 'ACTIVE'}
                  </button>
                </div>

                {/* Online E-commerce Payments */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#16161a',
                    borderRadius: '10px',
                    border: '1px solid #26262b',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Online Payments</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>Web stores and recurring subscriptions</div>
                  </div>
                  <button
                    onClick={() => setOnlinePurchases(!onlinePurchases)}
                    style={{
                      background: onlinePurchases ? '#10b981' : '#27272a',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {onlinePurchases ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* International Roaming */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#16161a',
                    borderRadius: '10px',
                    border: '1px solid #26262b',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>International Roaming</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>Allows foreign POS and foreign currency conversion</div>
                  </div>
                  <button
                    onClick={() => setIntlRoaming(!intlRoaming)}
                    style={{
                      background: intlRoaming ? '#3b82f6' : '#27272a',
                      color: '#ffffff',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {intlRoaming ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Daily ATM Limit Slider */}
                <div
                  style={{
                    padding: '16px',
                    background: '#16161a',
                    borderRadius: '10px',
                    border: '1px solid #26262b',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>Daily ATM Limit</span>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>${atmDailyLimit.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={atmDailyLimit}
                    onChange={(e) => setAtmDailyLimit(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#71717a', marginTop: '4px' }}>
                    <span>$500 min</span>
                    <span>$5,000 max</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TRANSFERS & SAVED PAYEES */}
        {/* ========================================================= */}
        {activeTab === 'transfers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {/* Left: Instant P2P Send */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Send size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Instant Transfer</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Send money directly by account number with live recipient verification.
              </p>

              {transferError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {transferError}
                </div>
              )}

              {transferSuccess && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#6ee7b7',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {transferSuccess}
                </div>
              )}

              <form onSubmit={executeTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Recipient Account Number (10 digits)</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. 9810276572"
                    value={transferData.recipientAccount}
                    onChange={(e) => setTransferData({ ...transferData, recipientAccount: e.target.value })}
                  />
                  {recipientLookup && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '8px 12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '6px',
                        color: '#34d399',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <UserCheck size={16} />
                      <span>Verified: {recipientLookup.recipientName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="input-label">Transfer Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  />
                  {/* Preset Pills */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {['25', '50', '100', '250', '500'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setTransferData({ ...transferData, amount: val })}
                        style={{
                          background: '#18181c',
                          border: '1px solid #27272a',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                        }}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Payment Note / Reference</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Rent, dinner, invoice #442"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">6-Digit Transaction PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    className="input-field"
                    placeholder="••••••"
                    value={transferData.pin}
                    onChange={(e) => setTransferData({ ...transferData, pin: e.target.value })}
                  />
                </div>

                {/* Save as Beneficiary Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="saveBen"
                    checked={transferData.saveBeneficiary}
                    onChange={(e) => setTransferData({ ...transferData, saveBeneficiary: e.target.checked })}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <label htmlFor="saveBen" style={{ fontSize: '0.85rem', color: '#a1a1aa', cursor: 'pointer' }}>
                    Save this payee to my saved beneficiaries list
                  </label>
                </div>

                {transferData.saveBeneficiary && (
                  <div>
                    <label className="input-label">Payee Nickname</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Landlord, John"
                      value={transferData.beneficiaryName}
                      onChange={(e) => setTransferData({ ...transferData, beneficiaryName: e.target.value })}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={transferLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '6px' }}
                >
                  {transferLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                  <span>{transferLoading ? 'Processing Double-Entry Ledger...' : 'Send Transfer Now'}</span>
                </button>
              </form>
            </div>

            {/* Right: Saved Beneficiaries Address Book */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Saved Payees</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Send money in 1 click to verified contacts</p>
                </div>

                <button
                  onClick={() => setIsAddBeneficiaryModalOpen(true)}
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.82rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                >
                  <Plus size={15} />
                  <span>Add Payee</span>
                </button>
              </div>

              {beneficiaries.length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    border: '1px dashed #26262b',
                    borderRadius: '12px',
                    color: '#71717a',
                  }}
                >
                  <UserCheck size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>No saved beneficiaries yet</p>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    Add frequent recipients to transfer instantly without typing account numbers.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {beneficiaries.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: '#16161a',
                        borderRadius: '10px',
                        border: '1px solid #26262b',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#1e1b4b',
                            border: '1px solid #6366f1',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                          }}
                        >
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                            {b.name} {b.nickname ? `(${b.nickname})` : ''}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                            {b.accountNumber} • {b.bankName}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => quickPayBeneficiary(b)}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Send size={13} />
                          <span>Pay</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBeneficiary(b.id)}
                          style={{ background: 'transparent', color: '#71717a', padding: '6px' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BILL PAYMENTS (UTILITIES & SERVICES) */}
        {/* ========================================================= */}
        {activeTab === 'bills' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {/* Left: Bill Pay Form */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Receipt size={22} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Bill & Utility Payments</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Pay electricity, internet, municipal water, or credit cards directly from your Zoorich Bank account.
              </p>

              {billError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {billError}
                </div>
              )}

              {/* Biller Category Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Select Utility Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px', marginTop: '6px' }}>
                  {[
                    { key: 'electricity', label: 'Electricity', icon: Zap, biller: 'Swissgrid & Axpo Power' },
                    { key: 'internet', label: 'Fiber Net', icon: Wifi, biller: 'Swisscom Fiber 10G' },
                    { key: 'water', label: 'Water Utility', icon: Droplets, biller: 'Zurich Water Authority' },
                    { key: 'mobile', label: '5G Mobile', icon: Smartphone, biller: 'Sunrise Swiss Mobile' },
                    { key: 'creditCard', label: 'Credit Card', icon: CreditCard, biller: 'Swiss Gold Mastercard' },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = billCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setBillCategory(cat.key as any);
                          setBillerName(cat.biller);
                        }}
                        style={{
                          background: isSelected ? '#1e1b4b' : '#141417',
                          border: isSelected ? '1px solid #6366f1' : '1px solid #26262b',
                          borderRadius: '8px',
                          padding: '10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          color: isSelected ? '#ffffff' : '#a1a1aa',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        <Icon size={18} color={isSelected ? '#38bdf8' : '#71717a'} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={executeBillPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Selected Biller</label>
                  <input type="text" readOnly className="input-field" value={billerName} style={{ background: '#1c1c22' }} />
                </div>

                <div>
                  <label className="input-label">Consumer / Account / Meter Number</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. ACC-8849201"
                    value={billAccountNo}
                    onChange={(e) => setBillAccountNo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Bill Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    className="input-field"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">6-Digit Transaction PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    className="input-field"
                    placeholder="••••••"
                    value={billPin}
                    onChange={(e) => setBillPin(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={billLoading}
                  className="btn-emerald"
                  style={{ width: '100%', padding: '14px', marginTop: '6px' }}
                >
                  {billLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  <span>{billLoading ? 'Settling Payment...' : `Pay $${parseFloat(billAmount || '0').toFixed(2)} Bill`}</span>
                </button>
              </form>
            </div>

            {/* Right: Bill Payment History & Digital Receipt */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Electronic Settlement Receipts
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Instant confirmation vouchers with unique transaction signatures.
              </p>

              {billReceipt ? (
                <div
                  style={{
                    background: '#16161c',
                    border: '1px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span className="badge badge-success">✓ PAYMENT SETTLED</span>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                      {billReceipt.receiptNumber}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Total Paid to {billReceipt.billerName}</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                      ${billReceipt.amount.toFixed(2)}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#0d0d10',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>Biller Category:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{billReceipt.category.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>Account / Meter:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{billReceipt.accountNo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>Paid From:</span>
                      <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{billReceipt.paidFrom}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#a1a1aa' }}>Date & Time:</span>
                      <span style={{ color: '#ffffff' }}>{new Date(billReceipt.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="btn-secondary"
                    style={{ width: '100%', marginTop: '16px', padding: '10px', fontSize: '0.85rem' }}
                  >
                    <Printer size={16} />
                    <span>Print Bill Receipt</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: '1px dashed #26262b',
                    borderRadius: '12px',
                    color: '#71717a',
                  }}
                >
                  <Receipt size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No recent bill payment receipt</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Submit a utility payment on the left to generate an electronic receipt voucher.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SAVINGS VAULTS & POCKETS */}
        {/* ========================================================= */}
        {activeTab === 'vaults' && (
          <div>
            {/* High-Yield APY Banner */}
            <div
              className="clean-card"
              style={{
                padding: '24px 28px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0d0d12 100%)',
                border: '1px solid #4338ca',
                borderRadius: '16px',
                marginBottom: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={20} color="#38bdf8" />
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em' }}>
                    HIGH-YIELD SAVINGS ENGINE
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                  Earn <span style={{ color: '#34d399' }}>4.85% APY</span> on All Vault Balances
                </h2>
                <p style={{ color: '#c7d2fe', fontSize: '0.88rem', marginTop: '4px' }}>
                  Separate your money into dedicated goal vaults. Compounded daily with zero lock-in fees.
                </p>
              </div>

              <button
                onClick={() => setIsVaultModalOpen(true)}
                className="btn-primary"
                style={{ padding: '12px 20px', fontSize: '0.9rem' }}
              >
                <Plus size={16} />
                <span>Create New Vault</span>
              </button>
            </div>

            {/* Vaults Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {vaults.map((vault) => {
                const percent = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));

                return (
                  <div
                    key={vault.id}
                    className="clean-card"
                    style={{
                      padding: '24px',
                      backgroundColor: '#0d0d10',
                      border: '1px solid #222226',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '2rem' }}>{vault.icon}</span>
                        <span className="badge badge-success">{percent}% COMPLETED</span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>{vault.name}</h3>
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                          ${vault.currentAmount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>
                          of ${vault.targetAmount.toLocaleString()} goal
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '8px',
                          background: '#1f1f26',
                          borderRadius: '999px',
                          margin: '16px 0 8px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button
                        onClick={() => setVaultActionModal({ vault, type: 'deposit' })}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                      >
                        <Plus size={15} />
                        <span>Add Money</span>
                      </button>

                      <button
                        onClick={() => setVaultActionModal({ vault, type: 'withdraw' })}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                      >
                        <ArrowDownToLine size={15} />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ANALYTICS & E-STATEMENTS */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div>
            {/* Statement Header Card */}
            <div
              className="clean-card"
              style={{
                padding: '24px 28px',
                backgroundColor: '#0d0d10',
                border: '1px solid #222226',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>Official Account Statements</h3>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px' }}>
                  Generate and export bank-grade monthly statements with full ledger journal records.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  value={statementPeriod}
                  onChange={(e) => setStatementPeriod(e.target.value)}
                  style={{
                    background: '#16161a',
                    border: '1px solid #26262b',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    color: '#ffffff',
                  }}
                >
                  <option value="Current Month">September 2026 (Current Month)</option>
                  <option value="August 2026">August 2026</option>
                  <option value="Year-to-Date 2026">Year-to-Date 2026</option>
                </select>

                <button
                  onClick={() => setIsStatementModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <FileText size={16} />
                  <span>Generate e-Statement</span>
                </button>
              </div>
            </div>

            {/* Spending Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Cash Flow Summary */}
              <div className="clean-card" style={{ padding: '24px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                  Cash Flow Metrics
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      padding: '14px',
                      background: '#141418',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Deposits & Credits</span>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                      +${totalInflow.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: '#141418',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Total Debits & Transfers Out</span>
                    <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>
                      -${totalOutflow.toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: '#141418',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Net Monthly Change</span>
                    <span
                      style={{
                        color: totalInflow - totalOutflow >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                      }}
                    >
                      {totalInflow - totalOutflow >= 0 ? '+' : ''}${(totalInflow - totalOutflow).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="clean-card" style={{ padding: '24px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                  Spending By Category
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#e4e4e7' }}>P2P Peer Transfers</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>45%</span>
                    </div>
                    <div style={{ height: '6px', background: '#1c1c22', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', background: '#38bdf8' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#e4e4e7' }}>Utility Bills & Services</span>
                      <span style={{ color: '#6366f1', fontWeight: 700 }}>30%</span>
                    </div>
                    <div style={{ height: '6px', background: '#1c1c22', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '30%', height: '100%', background: '#6366f1' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: '#e4e4e7' }}>ATM Cash Withdrawals</span>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>25%</span>
                    </div>
                    <div style={{ height: '6px', background: '#1c1c22', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '25%', height: '100%', background: '#f59e0b' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: SECURITY & PIN SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {/* Change 6-Digit PIN */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <KeyRound size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Update Transaction PIN</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Your 6-digit PIN authorizes transfers, withdrawals, and bill payments.
              </p>

              {pinChangeMessage && (
                <div
                  style={{
                    background:
                      pinChangeMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${pinChangeMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    color: pinChangeMessage.type === 'success' ? '#6ee7b7' : '#fca5a5',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                  }}
                >
                  {pinChangeMessage.text}
                </div>
              )}

              <form onSubmit={handleSetupPin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>Current Account Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Enter current login password"
                    value={currentPasswordForPin}
                    onChange={(e) => setCurrentPasswordForPin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">New 6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    className="input-field"
                    placeholder="e.g. 123456"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="input-label">Confirm New 6-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    className="input-field"
                    placeholder="Repeat 6-digit PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={pinChangeLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '6px' }}
                >
                  {pinChangeLoading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  <span>{pinChangeLoading ? 'Hashing PIN...' : 'Update Transaction PIN'}</span>
                </button>
              </form>
            </div>

            {/* 2FA TOTP Authentication */}
            <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <ShieldCheck size={22} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Two-Factor Auth (2FA)</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                Google Authenticator & Authy TOTP protection for sign-in and major transactions.
              </p>

              {user?.isTwoFactorEnabled ? (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid #10b981',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1.1rem' }}>2FA is Active & Protected</div>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa', marginTop: '4px' }}>
                    Your Zurich Bank account requires a 6-digit TOTP code during sensitive access.
                  </p>
                </div>
              ) : twoFactorData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#e4e4e7', textAlign: 'center' }}>
                    Scan this QR code with Google Authenticator or Authy:
                  </p>
                  <img
                    src={twoFactorData.qrCodeDataUrl}
                    alt="2FA QR Code"
                    style={{ width: '160px', height: '160px', borderRadius: '8px', background: '#ffffff', padding: '6px' }}
                  />
                  <div style={{ fontSize: '0.78rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                    Secret: {twoFactorData.secret}
                  </div>

                  <form onSubmit={handleVerify2FA} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="input-field"
                      placeholder="Enter 6-digit code from app"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                    />
                    <button type="submit" disabled={twoFactorLoading} className="btn-emerald" style={{ width: '100%', padding: '12px' }}>
                      {twoFactorLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Smartphone size={36} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>2FA is not enabled yet</p>
                  <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '4px 0 20px' }}>
                    Add bank-grade authenticator app security to protect against unauthorized access.
                  </p>
                  <button onClick={handleGenerate2FA} disabled={twoFactorLoading} className="btn-primary" style={{ padding: '12px 24px' }}>
                    <Lock size={16} />
                    <span>Setup 2FA Protection</span>
                  </button>
                </div>
              )}

              {twoFactorMessage && (
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#38bdf8', textAlign: 'center' }}>
                  {twoFactorMessage}
                </div>
              )}
            </div>

            {/* Audit Logs Table */}
            <div
              className="clean-card"
              style={{
                gridColumn: '1 / -1',
                padding: '24px',
                backgroundColor: '#0d0d10',
                border: '1px solid #222226',
              }}
            >
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Security Audit Trail
              </h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '16px' }}>
                Immutable log of logins, transfers, and security parameter updates.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #26262b', color: '#a1a1aa' }}>
                      <th style={{ padding: '10px 14px' }}>Action</th>
                      <th style={{ padding: '10px 14px' }}>Client IP</th>
                      <th style={{ padding: '10px 14px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#71717a' }}>
                          No audit entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.slice(0, 10).map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #1a1a20' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>
                            <span className="badge badge-pill">{log.action}</span>
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#a1a1aa' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#a1a1aa' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PROFILE & KYC DOSSIER */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Hero Profile Dossier Card */}
            <div
              className="clean-card"
              style={{
                padding: '32px 28px',
                backgroundColor: '#0d0d10',
                border: '1px solid #222226',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(13, 13, 16, 1) 0%, rgba(20, 20, 28, 1) 100%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                      color: '#ffffff',
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid #1e293b',
                      flexShrink: 0,
                    }}
                  >
                    {user?.firstName?.[0] || 'A'}
                    {user?.lastName?.[0] || 'Z'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1))',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          color: '#facc15',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Sparkles size={12} />
                        Private Wealth Client • Tier 1
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#a1a1aa' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={15} color="#38bdf8" />
                        <span>{user?.email}</span>
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={15} color="#10b981" />
                        <span>{user?.phone || 'No phone registered'}</span>
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#71717a' }}>Client ID:</span>
                        <code style={{ color: '#e4e4e7', fontSize: '0.8rem', background: '#1c1c24', padding: '2px 6px', borderRadius: '4px' }}>
                          {user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : 'N/A'}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            if (user?.id) {
                              navigator.clipboard.writeText(user.id);
                              setCopiedId(true);
                              setTimeout(() => setCopiedId(false), 2000);
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: copiedId ? '#10b981' : '#71717a', cursor: 'pointer', padding: 0 }}
                          title="Copy Client ID"
                        >
                          {copiedId ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      KYC Compliance
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>Verified (Tier 2)</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: '#7dd3fc', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      SMS OTP Recovery
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      {user?.phone ? 'Enabled' : 'Pending Phone'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Grid: Left Edit Form, Right KYC Dossier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
              {/* EDIT PERSONAL & CONTACT INFORMATION */}
              <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <UserCheck size={22} color="#38bdf8" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Personal Information</h3>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Update your official legal name and contact phone number used for SMS OTP recovery.
                </p>

                {profileMessage && (
                  <div
                    style={{
                      background: profileMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${profileMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                      borderRadius: '8px',
                      padding: '12px',
                      color: profileMessage.type === 'success' ? '#6ee7b7' : '#fca5a5',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '18px',
                    }}
                  >
                    {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setProfileLoading(true);
                    setProfileMessage(null);
                    try {
                      const res = await ApiClient.put('/auth/profile', {
                        firstName: profileFirstName,
                        lastName: profileLastName,
                        phone: profilePhone,
                      });
                      if (res.success && res.data) {
                        setUser(res.data);
                        localStorage.setItem('zoorich_user', JSON.stringify(res.data));
                        localStorage.setItem('nova_user', JSON.stringify(res.data));
                        setProfileMessage({ type: 'success', text: 'Profile details and phone number updated successfully!' });
                      }
                    } catch (err: any) {
                      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
                    } finally {
                      setProfileLoading(false);
                    }
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label">First Name</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="input-label">Last Name</label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={profileLastName}
                        onChange={(e) => setProfileLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Mobile Phone Number (SMS OTP)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        className="input-field"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. 9730927203 or +91 97309 27203"
                        style={{ paddingLeft: '40px' }}
                      />
                      <Phone size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    </div>
                    <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '6px' }}>
                      This phone number is used for 2-step SMS OTP verification if you forget your password.
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="input-label" style={{ marginBottom: 0 }}>Primary Registered Email</label>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>• Primary Account Identity</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        disabled
                        className="input-field"
                        value={user?.email || ''}
                        style={{ backgroundColor: '#141419', color: '#a1a1aa', cursor: 'not-allowed', paddingLeft: '40px' }}
                      />
                      <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                    </div>
                    <p style={{ color: '#71717a', fontSize: '0.75rem', marginTop: '6px' }}>
                      Contact branch compliance to transfer account ownership or primary email.
                    </p>
                  </div>

                  <div>
                    <label className="input-label">Banking Jurisdiction</label>
                    <input
                      type="text"
                      disabled
                      className="input-field"
                      value="Zurich Canton, Switzerland • Global Private Vault"
                      style={{ backgroundColor: '#141419', color: '#a1a1aa', cursor: 'not-allowed' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', marginTop: '6px' }}
                  >
                    {profileLoading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>

              {/* BANKING & KYC LEDGER DOSSIER */}
              <div className="clean-card" style={{ padding: '28px', backgroundColor: '#0d0d10', border: '1px solid #222226' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Building size={22} color="#10b981" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Ledger & Banking Dossier</h3>
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Cryptographic account details, IBAN identifiers, and transaction authorizations.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      background: '#131317',
                      border: '1px solid #222228',
                      borderRadius: '10px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                        Account Number
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedAccount?.accountNumber) {
                            navigator.clipboard.writeText(selectedAccount.accountNumber);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      {selectedAccount?.accountNumber || '9479576271'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#131317',
                      border: '1px solid #222228',
                      borderRadius: '10px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700 }}>
                        International Swiss IBAN
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>SEPA / SWIFT Ready</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {selectedAccount?.iban || 'CH93 0000 9479 5762 71'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                    }}
                  >
                    <div style={{ background: '#131317', border: '1px solid #222228', borderRadius: '10px', padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Account Type
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Private Checking</span>
                    </div>

                    <div style={{ background: '#131317', border: '1px solid #222228', borderRadius: '10px', padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#a1a1aa', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                        Daily Transfer Cap
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                        ${Number(selectedAccount?.dailyTransferLimit || 10000).toLocaleString('en-US')} USD
                      </span>
                    </div>
                  </div>

                  {/* Security Credentials Summary */}
                  <div style={{ marginTop: '8px', borderTop: '1px solid #222226', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                      Security Credentials Summary
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: '#a1a1aa' }}>6-Digit Transaction PIN</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: user?.hasPin ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {user?.hasPin ? 'Active & Enforced' : 'Not Configured'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Update
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: '#a1a1aa' }}>Two-Factor Auth (2FA)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: user?.isTwoFactorEnabled ? '#10b981' : '#71717a', fontWeight: 600 }}>
                            {user?.isTwoFactorEnabled ? 'Active (TOTP)' : 'Disabled'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Setup
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: '#a1a1aa' }}>Account Password</span>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Reset Password (OTP)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: SEND MONEY TRANSFER */}
      {/* ========================================================= */}
      {isTransferModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTransferModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Send Money</h3>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            {transferError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {transferError}
              </div>
            )}

            {transferSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#6ee7b7',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {transferSuccess}
              </div>
            )}

            <form onSubmit={executeTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Recipient Account Number (10 digits)</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. 9810276572"
                  value={transferData.recipientAccount}
                  onChange={(e) => setTransferData({ ...transferData, recipientAccount: e.target.value })}
                />
                {recipientLookup && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '6px',
                      color: '#34d399',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <UserCheck size={16} />
                    <span>Verified: {recipientLookup.recipientName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="input-label">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="input-field"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Note (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Payment description"
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">6-Digit Transaction PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  className="input-field"
                  placeholder="••••••"
                  value={transferData.pin}
                  onChange={(e) => setTransferData({ ...transferData, pin: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={transferLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              >
                {transferLoading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                <span>{transferLoading ? 'Authorizing Ledger...' : 'Send Transfer'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD MONEY (DEPOSIT) */}
      {/* ========================================================= */}
      {isDepositModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDepositModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Add Money</h3>
              <button onClick={() => setIsDepositModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '18px' }}>
              Simulate an instant cash deposit / check deposit into your selected account.
            </p>

            <form onSubmit={executeDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Deposit Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  className="input-field"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={depositLoading}
                className="btn-emerald"
                style={{ width: '100%', padding: '14px' }}
              >
                {depositLoading ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
                <span>{depositLoading ? 'Crediting Ledger...' : `Deposit $${depositAmount}`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: WITHDRAW CASH */}
      {/* ========================================================= */}
      {isWithdrawModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWithdrawModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>ATM Cash Withdrawal</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            {withdrawError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                {withdrawError}
              </div>
            )}

            {/* First Check Available Balance Card */}
            <div
              style={{
                background: '#16161c',
                border: '1px solid #26262b',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ color: '#a1a1aa', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Balance ({selectedAccount?.accountType || 'CHECKING'})
                </div>
                <div style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.35rem', marginTop: '2px' }}>
                  ${Number(selectedAccount?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span style={{ fontSize: '0.8rem', color: '#10b981', marginLeft: '6px', fontWeight: 600 }}>
                    {selectedAccount?.currency || 'USD'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWithdrawAmount(String(Number(selectedAccount?.balance || 0)))}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: '#38bdf8', color: '#38bdf8' }}
              >
                Withdraw All (Max)
              </button>
            </div>

            <form onSubmit={executeWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label">Withdrawal Amount ($ USD)</label>
                  {selectedAccount && Number(selectedAccount.balance) > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                      Max: ${Number(selectedAccount.balance).toFixed(2)}
                    </span>
                  )}
                </div>

                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  className="input-field"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />

                {/* Real-time Overdraft Balance Check Warning */}
                {withdrawAmount && parseFloat(withdrawAmount) > Number(selectedAccount?.balance || 0) && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      color: '#fca5a5',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertTriangle size={15} />
                    <span>
                      Amount exceeds available balance (${Number(selectedAccount?.balance || 0).toFixed(2)} USD).
                    </span>
                  </div>
                )}

                {/* Quick Preset Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {['10', '25', '50', '100', '250'].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setWithdrawAmount(val)}
                      style={{
                        background: '#18181c',
                        border: '1px solid #27272a',
                        color: '#ffffff',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(Number(selectedAccount?.balance || 0)))}
                    style={{
                      background: '#1e1b4b',
                      border: '1px solid #6366f1',
                      color: '#38bdf8',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Max
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">6-Digit Transaction PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  className="input-field"
                  placeholder="••••••"
                  value={withdrawPin}
                  onChange={(e) => setWithdrawPin(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={
                  withdrawLoading ||
                  !withdrawAmount ||
                  parseFloat(withdrawAmount) <= 0 ||
                  parseFloat(withdrawAmount) > Number(selectedAccount?.balance || 0) ||
                  withdrawPin.length !== 6
                }
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '14px',
                  opacity:
                    !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > Number(selectedAccount?.balance || 0) ||
                      withdrawPin.length !== 6
                      ? 0.5
                      : 1,
                }}
              >
                {withdrawLoading ? <RefreshCw className="animate-spin" size={18} /> : <ArrowDownToLine size={18} />}
                <span>
                  {withdrawLoading
                    ? 'Authorizing ATM...'
                    : withdrawAmount && parseFloat(withdrawAmount) > 0
                      ? `Withdraw $${parseFloat(withdrawAmount).toFixed(2)}`
                      : 'Withdraw Cash'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: OPEN NEW ACCOUNT */}
      {/* ========================================================= */}
      {isNewAccountModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewAccountModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Open New Bank Account</h3>
              <button onClick={() => setIsNewAccountModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Select Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setNewAccountType('SAVINGS')}
                    style={{
                      background: newAccountType === 'SAVINGS' ? '#1e1b4b' : '#141417',
                      border: newAccountType === 'SAVINGS' ? '1px solid #6366f1' : '1px solid #26262b',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>High-Yield Savings</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>4.85% APY</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAccountType('BUSINESS')}
                    style={{
                      background: newAccountType === 'BUSINESS' ? '#1e1b4b' : '#141417',
                      border: newAccountType === 'BUSINESS' ? '1px solid #6366f1' : '1px solid #26262b',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>Business Checking</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px' }}>High Velocity</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Initial Opening Deposit (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="input-field"
                  value={newAccountDeposit}
                  onChange={(e) => setNewAccountDeposit(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={newAccountLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '8px' }}
              >
                {newAccountLoading ? 'Creating Account...' : 'Open Account Instantly'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD BENEFICIARY */}
      {/* ========================================================= */}
      {isAddBeneficiaryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddBeneficiaryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Add New Beneficiary</h3>
              <button onClick={() => setIsAddBeneficiaryModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBeneficiary} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Full Legal Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Sarah Jenkins"
                  value={beneficiaryForm.name}
                  onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">10-Digit Account Number</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. 9810276572"
                  value={beneficiaryForm.accountNumber}
                  onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, accountNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Nickname / Category (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Sister, Landlord"
                  value={beneficiaryForm.nickname}
                  onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, nickname: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={beneficiaryLoading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '8px' }}
              >
                {beneficiaryLoading ? 'Saving Payee...' : 'Save Beneficiary'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: OFFICIAL TRANSACTION RECEIPT */}
      {/* ========================================================= */}
      {selectedTxReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedTxReceipt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <NovaLogo size="sm" subtitle="Official Receipt" />
              <button onClick={() => setSelectedTxReceipt(null)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
              <div style={{ fontSize: '0.82rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Transaction Total
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                ${Number(selectedTxReceipt.amount).toFixed(2)}
              </div>
              <span className="badge badge-success" style={{ marginTop: '8px' }}>
                ✓ SETTLED & VERIFIED
              </span>
            </div>

            <div
              style={{
                background: '#141418',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.85rem',
                border: '1px solid #26262b',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Reference Code:</span>
                <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{selectedTxReceipt.reference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Type:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedTxReceipt.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Description:</span>
                <span style={{ color: '#ffffff' }}>{selectedTxReceipt.description}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Date & Time:</span>
                <span style={{ color: '#ffffff' }}>{new Date(selectedTxReceipt.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a1a1aa' }}>Ledger Status:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Balanced (Zero-loss)</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '20px', padding: '12px' }}
            >
              <Printer size={16} />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: OFFICIAL BANK STATEMENT */}
      {/* ========================================================= */}
      {isStatementModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStatementModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '36px',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0d0d10',
            }}
          >
            {/* Statement Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #26262b', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <NovaLogo size="md" subtitle="Swiss Core Banking" />
                <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '6px' }}>
                  Zoorich Bank Ltd • Routing: #021000021 • BIC/Swift: ZOORCHZZ
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>ACCOUNT STATEMENT</div>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '2px' }}>Period: {statementPeriod}</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Generated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Account & Customer Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#16161c', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Account Holder</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{user?.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Account Details</div>
                <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                  Account No: {selectedAccount?.accountNumber}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                  IBAN: {selectedAccount?.iban}
                </div>
              </div>
            </div>

            {/* Balances Summary Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#141418', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>Total Deposits</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  +${totalInflow.toFixed(2)}
                </div>
              </div>

              <div style={{ background: '#141418', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>Total Withdrawals</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                  -${totalOutflow.toFixed(2)}
                </div>
              </div>

              <div style={{ background: '#141418', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>Ending Balance</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  ${Number(selectedAccount?.balance || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Statement Itemized Ledger Table */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '10px' }}>
                Itemized Transactions Ledger
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #26262b', color: '#a1a1aa' }}>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px' }}>Reference</th>
                    <th style={{ padding: '8px 10px' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 15).map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1c1c22' }}>
                      <td style={{ padding: '8px 10px', color: '#a1a1aa' }}>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#71717a' }}>{t.reference}</td>
                      <td style={{ padding: '8px 10px', color: '#ffffff' }}>{t.description}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        ${Number(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsStatementModalOpen(false)} className="btn-secondary" style={{ padding: '10px 18px' }}>
                Close
              </button>
              <button onClick={() => window.print()} className="btn-primary" style={{ padding: '10px 18px' }}>
                <Printer size={16} />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: CREATE VAULT */}
      {/* ========================================================= */}
      {isVaultModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVaultModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Create Savings Goal Vault</h3>
              <button onClick={() => setIsVaultModalOpen(false)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVault} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Goal Icon / Emoji</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['🛡️', '✈️', '🚗', '💻', '🏠', '💍', '🎓'].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setNewVaultIcon(ico)}
                      style={{
                        fontSize: '1.4rem',
                        padding: '8px',
                        background: newVaultIcon === ico ? '#1e1b4b' : '#141417',
                        border: newVaultIcon === ico ? '1px solid #6366f1' : '1px solid #26262b',
                        borderRadius: '8px',
                      }}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Goal Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Wedding, New Car"
                  value={newVaultName}
                  onChange={(e) => setNewVaultName(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Target Amount ($)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  className="input-field"
                  value={newVaultTarget}
                  onChange={(e) => setNewVaultTarget(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '6px' }}>
                Start Saving in Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 9: VAULT ACTION (ADD / WITHDRAW) */}
      {/* ========================================================= */}
      {vaultActionModal && (
        <div className="modal-overlay" onClick={() => setVaultActionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {vaultActionModal.type === 'deposit' ? 'Add Funds to Vault' : 'Withdraw from Vault'}
              </h3>
              <button onClick={() => setVaultActionModal(null)} style={{ background: 'transparent', color: '#a1a1aa' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '18px' }}>
              Goal: {vaultActionModal.vault.icon} {vaultActionModal.vault.name} (Current: $
              {vaultActionModal.vault.currentAmount.toLocaleString()})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  className="input-field"
                  value={vaultActionAmount}
                  onChange={(e) => setVaultActionAmount(e.target.value)}
                />
              </div>

              <button onClick={handleVaultAction} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                Confirm {vaultActionModal.type === 'deposit' ? 'Vault Deposit' : 'Vault Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile App Mode Bottom Navigation Bar */}
      <nav className="mobile-app-bottom-bar" aria-label="Mobile Navigation">
        <button
          onClick={() => setActiveTab('overview')}
          className={`mobile-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <Building size={19} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`mobile-nav-item ${activeTab === 'cards' ? 'active' : ''}`}
        >
          <CreditCard size={19} />
          <span>Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`mobile-nav-item ${activeTab === 'transfers' ? 'active' : ''}`}
        >
          <Send size={19} />
          <span>Pay</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`mobile-nav-item ${activeTab === 'bills' ? 'active' : ''}`}
        >
          <Receipt size={19} />
          <span>Bills</span>
        </button>

        <button
          onClick={() => setActiveTab('vaults')}
          className={`mobile-nav-item ${activeTab === 'vaults' ? 'active' : ''}`}
        >
          <PiggyBank size={19} />
          <span>Vaults</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`mobile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
        >
          <Lock size={19} />
          <span>Security</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <UserCheck size={19} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Forgot Password Popup Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialMethod="phone"
        initialIdentifier={user?.phone || user?.email || ''}
        onSuccess={() => {
          setIsForgotModalOpen(false);
          setPinChangeMessage({
            type: 'success',
            text: 'Password has been reset! Please enter your new password to update your PIN.',
          });
        }}
      />
    </div>
  );
}
