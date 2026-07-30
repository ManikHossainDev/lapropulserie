'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    useGetWalletOverviewQuery,
    useGetSuccessfulPaymentsQuery,
    useGetWithdrawalHistoryQuery,
    useGetWithdrawalDetailsQuery,
    useGetBankInfoQuery,
    useRequestWithdrawalMutation,
    useUpdateBankInfoMutation,
} from '@/redux/api/mentorApi';

const ITEMS_PER_PAGE = 6;

const Modal = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4">
                {children}
            </div>
        </div>
    );
};

const WithdrawalModal = ({ open, onClose, balance, onSubmit, isLoading }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const val = parseFloat(amount);
        if (!amount || isNaN(val)) return setError('Veuillez saisir un montant.');
        if (val < 10) return setError('Le retrait minimum est de 10 $.');
        if (val > balance) return setError(`Cannot exceed current balance of $${balance.toFixed(2)}.`);
        onSubmit({ amount: val });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Demande de retrait</h2>
                <p className="text-xs text-gray-400 mb-5">Soumettre une demande de retrait pour validation admin</p>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
                    <p className="text-xs text-gray-500 mb-1">Solde actuel</p>
                    <p className="text-xl font-bold text-indigo-800">${balance.toFixed(2)}</p>
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Withdrawal Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setError(''); }}
                            placeholder="0.00"
                            className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Min. : 10 $</p>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-50"
                    >
                        {isLoading ? 'Traitement...' : 'Soumettre la demande'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const EditAccountModal = ({ open, onClose, account, onSave, isLoading }) => {
    const [form, setForm] = useState({
        bankName: '',
        bankBranch: '',
        holderName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'Savings',
    });

    useEffect(() => {
        if (account) {
            setForm({
                bankName: account.bankName || '',
                bankBranch: account.branchName || '',
                holderName: account.accountHolderName || '',
                accountNumber: '',
                routingNumber: account.routingNumber || '',
                accountType: account.accountType === 'savings' ? 'Épargne' : account.accountType === 'current' ? 'Courant' : 'Épargne',
            });
        }
    }, [account]);

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const handleSave = () => {
        onSave({
            bankName: form.bankName,
            bankBranch: form.bankBranch,
            bankAccountHolderName: form.holderName,
            bankAccountNumber: form.accountNumber,
            bankRoutingNumber: form.routingNumber,
            bankAccountType: form.accountType.toLowerCase(),
        });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-base font-bold text-gray-900 mb-1">Informations du compte</h2>
                <p className="text-xs text-gray-400 mb-5">Coordonnées bancaires sécurisées pour les retraits</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Nom de la banque</label>
                        <input value={form.bankName} onChange={set('bankName')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Agence bancaire</label>
                        <input value={form.bankBranch} onChange={set('bankBranch')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Titulaire du compte</label>
                        <input value={form.holderName} onChange={set('holderName')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Numéro de compte</label>
                        <input value={form.accountNumber} onChange={set('accountNumber')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Saisir le numéro de compte" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Numéro de routage</label>
                        <input value={form.routingNumber} onChange={set('routingNumber')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Type de compte bancaire</label>
                        <div className="flex gap-2 mt-1">
                            {['Épargne', 'Courant'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setForm({ ...form, accountType: type })}
                                    className={`flex-1 text-xs py-2 rounded-xl border transition font-medium
                                        ${form.accountType === type
                                            ? 'bg-indigo-800 text-white border-indigo-800'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
                        disabled={isLoading}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-50"
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const InfoModal = ({ open, onClose, tx }) => (
    <Modal open={open} onClose={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Détails de la transaction</h2>
            {tx && (
                <div className="space-y-3 text-sm">
                    {[
                        ['No', tx.id],
                        ['Date de traitement', tx.processedDate ? new Date(tx.processedDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'],
                        ['ID de transaction', tx.transactionId || 'N/A'],
                        ['Amount', `$${(tx.amount || 0).toFixed(2)}`],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">{label}</span>
                            <span className="font-medium text-gray-800">{value}</span>
                        </div>
                    ))}
                </div>
            )}
            <button
                onClick={onClose}
                className="w-full mt-5 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
                Close
            </button>
        </div>
    </Modal>
);

const WithdrawDetailsModal = ({ open, onClose, withdrawalId }) => {
    const { data: detailsData, isLoading } = useGetWithdrawalDetailsQuery(withdrawalId, {
        skip: !open || !withdrawalId,
    });

    const details = detailsData?.data || detailsData || {};

    return (
        <Modal open={open} onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-base font-bold text-gray-900 mb-1">Détails du retrait</h2>
                <p className="text-xs text-gray-400 mb-5">Informations sur la demande de retrait</p>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Withdrawal ID</span>
                            <span className="font-medium text-gray-800">{details._id || details.id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Requested Date</span>
                            <span className="font-medium text-gray-800">
                                {details.requestDate ? new Date(details.requestDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Date de traitement</span>
                            <span className="font-medium text-gray-800">
                                {details.processedDate ? new Date(details.processedDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Amount</span>
                            <span className="font-medium text-gray-800">${(details.amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Status</span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border
                                ${details.status === 'Approved' || details.status === 'Completed'
                                    ? 'bg-green-50 text-green-600 border-green-200'
                                    : details.status === 'Rejected'
                                        ? 'bg-red-50 text-red-600 border-red-200'
                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${details.status === 'Approved' || details.status === 'Completed' ? 'bg-green-500' : details.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                {details.status || 'Pending'}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Nom de la banque</span>
                            <span className="font-medium text-gray-800">{details.bankName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-400">Numéro de compte</span>
                            <span className="font-medium text-gray-800">{details.accountNumber || 'N/A'}</span>
                        </div>
                        {details.adminNotes && (
                            <div className="flex flex-col border-b border-gray-50 pb-2">
                                <span className="text-gray-400 text-xs mb-1">Admin Notes</span>
                                <span className="font-medium text-gray-800 text-sm">{details.adminNotes}</span>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-5 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

const Page = () => {
    const [activeTab, setActiveTab] = useState('payments');
    const [page, setPage] = useState(1);
    const [withdrawalOpen, setWithdrawalOpen] = useState(false);
    const [editAccountOpen, setEditAccountOpen] = useState(false);
    const [infoTx, setInfoTx] = useState(null);
    const [withdrawDetailsId, setWithdrawDetailsId] = useState(null);

    const { data: walletData, isLoading: walletLoading } = useGetWalletOverviewQuery();
    const { data: paymentsData, isLoading: paymentsLoading } = useGetSuccessfulPaymentsQuery({ page, limit: ITEMS_PER_PAGE });
    const { data: withdrawalData, isLoading: withdrawalLoading } = useGetWithdrawalHistoryQuery({ page: 1, limit: 10 });
    const { data: bankInfoData, isLoading: bankLoading } = useGetBankInfoQuery();
    const [requestWithdrawal, { isLoading: withdrawalSubmitting }] = useRequestWithdrawalMutation();
    const [updateBankInfo, { isLoading: bankSaveLoading }] = useUpdateBankInfoMutation();

    const wallet = walletData?.data || walletData;
    const payments = paymentsData?.data || paymentsData || [];
    const withdrawals = withdrawalData?.data || withdrawalData || [];
    const bankInfo = bankInfoData?.data || bankInfoData;

    const balance = wallet?.currentBalance || 0;
    const pendingCount = wallet?.pendingWithdrawalsCount || 0;
    const totalEarnings = wallet?.totalEarnings || 0;

    const handleWithdrawalSubmit = async (data) => {
        try {
            await requestWithdrawal(data).unwrap();
            alert('Demande de retrait envoyée avec succès !');
            setWithdrawalOpen(false);
        } catch (error) {
            alert(error?.data?.message || "Échec de l'envoi de la demande de retrait");
        }
    };

    const handleBankSave = async (data) => {
        try {
            await updateBankInfo(data).unwrap();
            alert('Informations bancaires enregistrées avec succès !');
            setEditAccountOpen(false);
        } catch (error) {
            alert(error?.data?.message || "Échec de l'enregistrement des informations bancaires");
        }
    };

    const currentData = activeTab === 'payments' ? payments : withdrawals;
    const isLoadingPayments = activeTab === 'payments' ? paymentsLoading : withdrawalLoading;

    return (
        <div className="relative py-10">
            <div className="absolute -z-10 inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />

            <div className="p-4 z-[999] space-y-4 max-w-6xl mx-auto bg-gray-100 rounded-2xl my-5 shadow-sm">

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                    <div className="bg-indigo-900 text-white rounded-2xl p-10 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-medium opacity-80">Solde actuel</p>
                            <span className="text-3xl">💵</span>
                        </div>
                        {walletLoading ? (
                            <div className="h-12 bg-indigo-800 animate-pulse rounded"></div>
                        ) : (
                                <p className="text-5xl font-bold">${balance.toFixed(2)}</p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-medium text-gray-500">Retraits en attente</p>
                            <span className="text-3xl">⏰</span>
                        </div>
                        {walletLoading ? (
                            <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                        ) : (
                            <p className="text-5xl font-bold text-red-500">{pendingCount}</p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-medium text-gray-500">Gains totaux</p>
                            <span className="text-3xl">📈</span>
                        </div>
                        {walletLoading ? (
                            <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                        ) : (
                            <p className="text-5xl font-bold text-green-500">${totalEarnings.toFixed(2)}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className=" font-bold text-gray-900">Historique des transactions</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Consultez vos paiements et l'historique des retraits</p>
                        </div>
                        <button
                            onClick={() => setWithdrawalOpen(true)}
                            className="flex items-center gap-1.5 bg-primary hover:bg-indigo-700 text-white text-xs font-medium px-3 py-3 rounded-lg transition"
                        >
                            $  Demande de retrait
                        </button>
                    </div>

                    <div className="flex bg-gray-100 rounded-xl p-1 my-4 ">
                        {[['payments', 'Paiements réussis'], ['withdrawals', 'Historique des retraits']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setActiveTab(key); setPage(1); }}
                                className={`flex-1 text-base font-medium py-2 rounded-lg transition-all
                                ${activeTab === key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-xl overflow-x-auto  border border-gray-100">
                        <div className="min-w-[600px]">
                            <div className={`grid text-xs font-semibold text-indigo-700 bg-indigo-50 px-4 py-3 ${activeTab === 'payments' ? 'grid-cols-5' : 'grid-cols-5'}`}>
                                <span>N°</span>
                                <span>Date de traitement</span>
                                <span>ID de transaction</span>
                                <span>Montant</span>
                                <span className="text-center">Détails</span>
                            </div>

                            {isLoadingPayments ? (
                                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-5 px-4 py-3 text-xs text-gray-600 items-center border-t border-gray-50">
                                        <div className="h-4 bg-gray-100 animate-pulse rounded"></div>
                                    </div>
                                ))
                            ) : currentData.length > 0 ? (
                                currentData.map((row, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-5 px-4 py-3 text-xs text-gray-600 items-center border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <span className="text-gray-400">{i + 1}</span>
                                        <span>
                                            {row.processedDate || row.requestDate
                                                ? new Date(row.processedDate || row.requestDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                : 'N/A'}
                                        </span>
                                        <span className="text-gray-500">{row.transactionId || row._id}</span>
                                        <span>${(row.amount || 0).toFixed(2)}</span>
                                        <Link href={`/mentor/wallet/${row._id || row.id}`} className="flex justify-center">
                                            {activeTab === 'payments' ? (
                                                <button
                                                    onClick={() => setInfoTx(row)}
                                                    className="w-7 h-7 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setWithdrawDetailsId(row._id || row.id)}
                                                    className="w-7 h-7 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                    No data found
                                </div>
                            )}
                        </div>
                    </div>

                    {activeTab === 'payments' && (
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || paymentsLoading}
                                className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 px-2 py-1"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={currentData.length < ITEMS_PER_PAGE || paymentsLoading}
                                className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-30 px-2 py-1"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">Informations du compte</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Coordonnées bancaires sécurisées pour les retraits</p>
                        </div>
                        <button
                            onClick={() => setEditAccountOpen(true)}
                            className="flex items-center gap-1.5 bg-primary hover:bg-indigo-700 text-white text-xs font-medium px-3 py-3 rounded-lg transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Details
                        </button>
                    </div>

                    {bankLoading ? (
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="border border-gray-100 rounded-xl p-3">
                                    <div className="h-4 bg-gray-100 animate-pulse rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: '👤', label: 'Account Holder', value: bankInfo?.accountHolderName || 'Not set' },
                                    { icon: '🏦', label: 'Nom de la banque', value: bankInfo?.bankName || 'Not set' },
                                    { icon: '💳', label: 'Numéro de compte', value: bankInfo?.accountNumber || 'Not set' },
                                    { icon: '#', label: 'Numéro de routage', value: bankInfo?.routingNumber || 'Not set' },
                                ].map((item) => (
                                    <div key={item.label} className="border border-gray-100 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-sm">{item.icon}</span>
                                            <span className="text-xs text-gray-400">{item.label}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                    )}
                </div>

                <WithdrawalModal
                    open={withdrawalOpen}
                    onClose={() => setWithdrawalOpen(false)}
                    balance={balance}
                    onSubmit={handleWithdrawalSubmit}
                    isLoading={withdrawalSubmitting}
                />
                <EditAccountModal
                    open={editAccountOpen}
                    onClose={() => setEditAccountOpen(false)}
                    account={bankInfo}
                    onSave={handleBankSave}
                    isLoading={bankSaveLoading}
                />
                <InfoModal
                    open={!!infoTx}
                    onClose={() => setInfoTx(null)}
                    tx={infoTx}
                />
                <WithdrawDetailsModal
                    open={!!withdrawDetailsId}
                    onClose={() => setWithdrawDetailsId(null)}
                    withdrawalId={withdrawDetailsId}
                />
            </div>
        </div>
    );
};

export default Page;