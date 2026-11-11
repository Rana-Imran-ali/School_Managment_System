import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Printer,
  Eye,
  Clock,
  Layers,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import type { FeePayment, FeeStructure, FeeType } from '../types';
import {
  initialFeePayments,
  initialFeeStructures,
  initialFeeTypes,
  initialStudents,
  initialClasses,
  getStoredData,
  saveStoredData,
} from '../data/mockData';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { feeService } from '../api/feeService';
import { useAuth } from '../context/AuthContext';

export const Fees: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'structures' | 'ledger'>('payments');

  const [payments, setPayments] = useState<FeePayment[]>(() =>
    getStoredData('fee_payments_list', initialFeePayments)
  );
  const [structures, setStructures] = useState<FeeStructure[]>(() =>
    getStoredData('fee_structures_list', initialFeeStructures)
  );
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(() =>
    getStoredData('fee_types_list', initialFeeTypes)
  );

  // Student Fee Ledger state
  const [selectedLedgerStudentId, setSelectedLedgerStudentId] = useState<number | null>(null);
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);

  const fetchLedger = async (studentId: number) => {
    setSelectedLedgerStudentId(studentId);
    setIsLoadingLedger(true);
    try {
      const data = await feeService.getStudentFeeLedger(studentId);
      setLedgerData(data);
    } catch (err) {
      console.error('Failed to load student ledger:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  };
  React.useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      feeService.getFeePayments(),
      feeService.getFeeStructures(),
      feeService.getFeeTypes(),
    ]).then(([payRes, structRes, typeRes]) => {
      if (!isMounted) return;

      if (payRes.status === 'fulfilled' && payRes.value?.items && payRes.value.items.length > 0) {
        setPayments(payRes.value.items);
        saveStoredData('fee_payments_list', payRes.value.items);
      }
      if (structRes.status === 'fulfilled' && structRes.value && structRes.value.length > 0) {
        setStructures(structRes.value);
        saveStoredData('fee_structures_list', structRes.value);
      }
      if (typeRes.status === 'fulfilled' && typeRes.value && typeRes.value.length > 0) {
        setFeeTypes(typeRes.value);
        saveStoredData('fee_types_list', typeRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
  const [isFeeTypeModalOpen, setIsFeeTypeModalOpen] = useState(false);
  const [feeTypeForm, setFeeTypeForm] = useState({ name: '', description: '' });
  const [isFeeStructureModalOpen, setIsFeeStructureModalOpen] = useState(false);
  const [feeStructureForm, setFeeStructureForm] = useState({
    fee_type_id: 1,
    school_class_id: 2,
    amount: 1500,
    due_date: '2026-11-30',
  });

  // Collect Payment Form
  const [collectForm, setCollectForm] = useState({
    student_profile_id: 1,
    fee_type_id: 1,
    amount_paid: 2400.0,
    payment_method: 'online' as FeePayment['payment_method'],
    transaction_id: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: 'paid' as FeePayment['status'],
    receipt_number: `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    remarks: 'Full payment received',
  });

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      student_profile_id: Number(collectForm.student_profile_id),
      fee_type_id: Number(collectForm.fee_type_id),
      amount_paid: Number(collectForm.amount_paid),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: collectForm.payment_method,
      transaction_id: collectForm.transaction_id,
      status: collectForm.status,
      receipt_number: collectForm.receipt_number,
      remarks: collectForm.remarks,
      recorded_by: 1,
    };

    try {
      await feeService.recordPayment(payload as any);
    } catch (err) {
      console.warn('Backend fee payment record error, saving locally:', err);
    }

    const newPayment: FeePayment = {
      id: Date.now(),
      ...payload,
    };

    const updated = [newPayment, ...payments];
    setPayments(updated);
    saveStoredData('fee_payments_list', updated);
    setIsCollectModalOpen(false);
  };

  const handleCreateFeeType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await feeService.createFeeType(feeTypeForm);
      const newType: FeeType = created || { id: Date.now(), ...feeTypeForm };
      const updated = [...feeTypes, newType];
      setFeeTypes(updated);
      saveStoredData('fee_types_list', updated);
      setIsFeeTypeModalOpen(false);
      setFeeTypeForm({ name: '', description: '' });
    } catch (err) {
      console.warn('Backend fee type create error, saving locally:', err);
      const newType: FeeType = { id: Date.now(), ...feeTypeForm };
      const updated = [...feeTypes, newType];
      setFeeTypes(updated);
      saveStoredData('fee_types_list', updated);
      setIsFeeTypeModalOpen(false);
      setFeeTypeForm({ name: '', description: '' });
    }
  };

  const handleDeleteFeeType = async (id: number) => {
    if (!window.confirm('Delete this fee category?')) return;
    try {
      await feeService.deleteFeeType(id);
    } catch (err) {
      console.warn('Backend fee type delete error, removing locally:', err);
    }
    const updated = feeTypes.filter((t) => t.id !== id);
    setFeeTypes(updated);
    saveStoredData('fee_types_list', updated);
  };

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fee_type_id: Number(feeStructureForm.fee_type_id),
      school_class_id: Number(feeStructureForm.school_class_id),
      academic_year_id: 1,
      amount: Number(feeStructureForm.amount),
      due_date: feeStructureForm.due_date,
    };
    try {
      const created = await feeService.createFeeStructure(payload);
      const newStruct: FeeStructure = created || { id: Date.now(), ...payload };
      const updated = [...structures, newStruct];
      setStructures(updated);
      saveStoredData('fee_structures_list', updated);
      setIsFeeStructureModalOpen(false);
    } catch (err) {
      console.warn('Backend fee structure create error, saving locally:', err);
      const newStruct: FeeStructure = { id: Date.now(), ...payload };
      const updated = [...structures, newStruct];
      setStructures(updated);
      saveStoredData('fee_structures_list', updated);
      setIsFeeStructureModalOpen(false);
    }
  };

  const handleDeleteFeeStructure = async (id: number) => {
    if (!window.confirm('Delete this class fee tariff?')) return;
    try {
      await feeService.deleteFeeStructure(id);
    } catch (err) {
      console.warn('Backend fee structure delete error, removing locally:', err);
    }
    const updated = structures.filter((s) => s.id !== id);
    setStructures(updated);
    saveStoredData('fee_structures_list', updated);
  };

  const totalCollected = payments
    .filter((p) => p.status === 'paid' || p.status === 'partial')
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const filteredPayments = payments.filter((p) => {
    const student = initialStudents.find((s) => s.id === p.student_profile_id);
    const matchesSearch =
      p.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="fees-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tuition & Financial Management</h1>
          <p className="page-subtitle">
            Fee structure configuration, payment collection terminal, and print-ready digital receipts.
          </p>
        </div>
        {currentRole === 'admin' && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setIsCollectModalOpen(true)}>
              <Plus size={16} /> Record Payment
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Revenue Collected</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            ${totalCollected.toLocaleString()}
          </div>
          <div className="stat-trend trend-up">All active transactions reconciled</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Verified Receipts</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <CreditCard size={22} />
            </div>
          </div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-trend">Issued digital vouchers</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Pending Invoices</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="stat-value">{payments.filter((p) => p.status === 'pending').length}</div>
          <div className="stat-trend" style={{ color: 'var(--warning)' }}>Awaiting guardian transfer</div>
        </div>
      </div>

      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} /> {currentRole === 'parent' ? "My Child's Invoices & Receipts" : 'Transaction Ledger'}
        </button>
        {currentRole === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`}
            onClick={() => setActiveTab('structures')}
          >
            <Layers size={16} /> Class Fee Schedules
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('ledger');
            if (!selectedLedgerStudentId && initialStudents.length > 0) {
              fetchLedger(initialStudents[0].id);
            }
          }}
        >
          <FileSpreadsheet size={16} /> Student Fee Ledger
        </button>
      </div>

      {/* TAB 1: Payment Transactions */}
      {activeTab === 'payments' && (
        <div>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by receipt no, student name, or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Transactions</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Voucher</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const student = initialStudents.find((s) => s.id === p.student_profile_id);
                  const feeType = feeTypes.find((f) => f.id === p.fee_type_id);

                  return (
                    <tr key={p.id}>
                      <td>
                        <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                          {p.receipt_number}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{(p as any).student_name || student?.user?.name || 'Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {(p as any).admission_number || student?.admission_number}
                        </div>
                      </td>
                      <td>{(p as any).fee_type_name || feeType?.name || 'Tuition Fee'}</td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>${p.amount_paid.toLocaleString()}</strong>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.payment_date}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {p.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedReceipt(p)}
                          title="View Official Receipt"
                        >
                          <Eye size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Fee Structures & Fee Types */}
      {activeTab === 'structures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentRole === 'admin' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setIsFeeTypeModalOpen(true)}
              >
                <Plus size={16} /> Add Fee Category
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setIsFeeStructureModalOpen(true)}
              >
                <Plus size={16} /> Configure Class Tariff
              </button>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <div className="panel-header" style={{ padding: '0.75rem 1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Class-Wise Fee Structure Tariffs
              </h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Grade / Class</th>
                  <th>Fee Category</th>
                  <th>Required Tariff</th>
                  <th>Payment Due Date</th>
                  <th>Academic Session</th>
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {structures.map((str) => {
                  const cls = initialClasses.find((c) => c.id === str.school_class_id);
                  const type = feeTypes.find((t) => t.id === str.fee_type_id);
                  return (
                    <tr key={str.id}>
                      <td style={{ fontWeight: 700 }}>{cls?.name || 'Grade 10'}</td>
                      <td>{type?.name || 'Tuition Fee'}</td>
                      <td><strong style={{ color: 'var(--success)' }}>${str.amount.toFixed(2)}</strong></td>
                      <td>{str.due_date}</td>
                      <td>2025-2026</td>
                      {currentRole === 'admin' && (
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Fee Structure"
                            onClick={() => handleDeleteFeeStructure(str.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Configured Fee Categories / Types */}
          <div className="glass-panel" style={{ padding: '0.5rem' }}>
            <div className="panel-header" style={{ padding: '0.75rem 1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Configured Fee Types & Categories
              </h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  {currentRole === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {feeTypes.map((ft) => (
                  <tr key={ft.id}>
                    <td style={{ fontWeight: 600 }}>{ft.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ft.description || 'Standard institutional category'}</td>
                    {currentRole === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Fee Category"
                          onClick={() => handleDeleteFeeType(ft.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Student Fee Ledger */}
      {activeTab === 'ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Student:</label>
            <select
              className="form-select"
              style={{ maxWidth: '320px' }}
              value={selectedLedgerStudentId || ''}
              onChange={(e) => fetchLedger(Number(e.target.value))}
            >
              {initialStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user?.name} ({st.admission_number})
                </option>
              ))}
            </select>
          </div>

          {isLoadingLedger ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              Loading student ledger...
            </div>
          ) : ledgerData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Summary Cards */}
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Total Invoiced</span>
                    <DollarSign size={20} color="var(--primary)" />
                  </div>
                  <div className="stat-value">${ledgerData.total_invoiced?.toFixed(2) || '0.00'}</div>
                  <div className="stat-trend">Academic Year Schedule</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Total Paid</span>
                    <CreditCard size={20} color="var(--success)" />
                  </div>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    ${ledgerData.total_paid?.toFixed(2) || '0.00'}
                  </div>
                  <div className="stat-trend trend-up">Cleared settlements</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Outstanding Balance</span>
                    <Clock size={20} color="var(--danger)" />
                  </div>
                  <div className="stat-value" style={{ color: ledgerData.outstanding_due > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ${ledgerData.outstanding_due?.toFixed(2) || '0.00'}
                  </div>
                  <div className="stat-trend" style={{ color: ledgerData.outstanding_due > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {ledgerData.outstanding_due > 0 ? 'Payment Required' : 'Fully Paid'}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="glass-panel" style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: 600 }}>Ledger Payment History</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Category</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerData.payments && ledgerData.payments.length > 0 ? (
                      ledgerData.payments.map((p: any) => (
                        <tr key={p.id}>
                          <td><code>{p.receipt_number}</code></td>
                          <td>{p.fee_type?.name || 'Tuition Fee'}</td>
                          <td><strong>${Number(p.amount_paid).toFixed(2)}</strong></td>
                          <td>{p.payment_date}</td>
                          <td><span className="badge badge-info">{p.payment_method}</span></td>
                          <td><StatusBadge status={p.status} /></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          No payment transactions recorded for this student yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a student above to inspect their fee ledger statements.
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal isOpen={isCollectModalOpen} onClose={() => setIsCollectModalOpen(false)} title="Record Fee Transaction">
        <form onSubmit={handleRecordPayment}>
          <div className="form-group">
            <label className="form-label">Student Recipient *</label>
            <select
              className="form-select"
              value={collectForm.student_profile_id}
              onChange={(e) => setCollectForm({ ...collectForm, student_profile_id: Number(e.target.value) })}
            >
              {initialStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user?.name} ({st.admission_number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fee Category *</label>
              <select
                className="form-select"
                value={collectForm.fee_type_id}
                onChange={(e) => setCollectForm({ ...collectForm, fee_type_id: Number(e.target.value) })}
              >
                {feeTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Paid ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={collectForm.amount_paid}
                onChange={(e) => setCollectForm({ ...collectForm, amount_paid: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Channel</label>
              <select
                className="form-select"
                value={collectForm.payment_method}
                onChange={(e) => setCollectForm({ ...collectForm, payment_method: e.target.value as any })}
              >
                <option value="online">Online Gateway (Stripe/Card)</option>
                <option value="card">Point of Sale (Terminal)</option>
                <option value="cash">Cash Tendered</option>
                <option value="bank_transfer">Wire / Direct Bank</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={collectForm.status}
                onChange={(e) => setCollectForm({ ...collectForm, status: e.target.value as any })}
              >
                <option value="paid">Fully Paid</option>
                <option value="partial">Partial Payment</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Receipt Number *</label>
              <input
                type="text"
                required
                className="form-input"
                value={collectForm.receipt_number}
                onChange={(e) => setCollectForm({ ...collectForm, receipt_number: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transaction Reference</label>
              <input
                type="text"
                className="form-input"
                value={collectForm.transaction_id}
                onChange={(e) => setCollectForm({ ...collectForm, transaction_id: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Auditor Remarks</label>
            <input
              type="text"
              className="form-input"
              value={collectForm.remarks}
              onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Official Voucher: ${selectedReceipt.receipt_number}`}
          maxWidth="680px"
        >
          {(() => {
            const student = initialStudents.find((s) => s.id === selectedReceipt.student_profile_id);
            const feeType = feeTypes.find((f) => f.id === selectedReceipt.fee_type_id);

            return (
              <div>
                <div className="receipt-paper" style={{ padding: '1.75rem' }}>
                  <div className="receipt-header">
                    <div style={{ fontSize: '0.78rem', letterSpacing: '0.1em', fontWeight: 800, color: '#6366f1' }}>
                      EDUCORE ACADEMY FINANCIAL SERVICES
                    </div>
                    <h2 className="receipt-title">FEE PAYMENT RECEIPT</h2>
                    <div className="receipt-sub">Receipt No: {selectedReceipt.receipt_number}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.85rem', margin: '1rem 0' }}>
                    <div><strong>Student:</strong> {student?.user?.name}</div>
                    <div><strong>Admission No:</strong> {student?.admission_number}</div>
                    <div><strong>Class:</strong> Grade 10 - Section A</div>
                    <div><strong>Payment Date:</strong> {selectedReceipt.payment_date}</div>
                    <div><strong>Payment Method:</strong> {selectedReceipt.payment_method.toUpperCase()}</div>
                    <div><strong>Reference:</strong> {selectedReceipt.transaction_id || 'N/A'}</div>
                  </div>

                  <table className="receipt-details-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Item Description</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: 'left' }}>{feeType?.name || 'Tuition Fee'} (Term 1)</td>
                        <td style={{ textAlign: 'right' }}><strong>${selectedReceipt.amount_paid.toFixed(2)}</strong></td>
                      </tr>
                      <tr className="receipt-total-row">
                        <td style={{ textAlign: 'left' }}>TOTAL SETTLED:</td>
                        <td style={{ textAlign: 'right', color: '#10b981' }}>
                          ${selectedReceipt.amount_paid.toFixed(2)} USD
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Status: <strong style={{ color: '#10b981' }}>VERIFIED & CLEARED</strong>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ borderBottom: '1px solid #334155', width: '130px', marginBottom: '0.25rem' }}></div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Cashier</div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedReceipt(null)}>
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={() => window.print()}>
                    <Printer size={16} /> Print Voucher
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Add Fee Category Modal */}
      {isFeeTypeModalOpen && (
        <Modal
          isOpen={isFeeTypeModalOpen}
          onClose={() => setIsFeeTypeModalOpen(false)}
          title="Create New Fee Category"
          maxWidth="500px"
        >
          <form onSubmit={handleCreateFeeType}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Science Lab Fee, Library Dues"
                value={feeTypeForm.name}
                onChange={(e) => setFeeTypeForm({ ...feeTypeForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Details regarding fee scope..."
                value={feeTypeForm.description}
                onChange={(e) => setFeeTypeForm({ ...feeTypeForm, description: e.target.value })}
              />
            </div>
            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFeeTypeModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Fee Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Fee Structure Tariff Modal */}
      {isFeeStructureModalOpen && (
        <Modal
          isOpen={isFeeStructureModalOpen}
          onClose={() => setIsFeeStructureModalOpen(false)}
          title="Configure Class Fee Tariff"
          maxWidth="520px"
        >
          <form onSubmit={handleCreateFeeStructure}>
            <div className="form-group">
              <label className="form-label">Fee Category *</label>
              <select
                className="form-select"
                value={feeStructureForm.fee_type_id}
                onChange={(e) =>
                  setFeeStructureForm({ ...feeStructureForm, fee_type_id: Number(e.target.value) })
                }
              >
                {feeTypes.map((ft) => (
                  <option key={ft.id} value={ft.id}>
                    {ft.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Class Placement *</label>
                <select
                  className="form-select"
                  value={feeStructureForm.school_class_id}
                  onChange={(e) =>
                    setFeeStructureForm({
                      ...feeStructureForm,
                      school_class_id: Number(e.target.value),
                    })
                  }
                >
                  {initialClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tariff Amount ($) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="form-input"
                  value={feeStructureForm.amount}
                  onChange={(e) =>
                    setFeeStructureForm({ ...feeStructureForm, amount: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={feeStructureForm.due_date}
                onChange={(e) =>
                  setFeeStructureForm({ ...feeStructureForm, due_date: e.target.value })
                }
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFeeStructureModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Fee Tariff
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
