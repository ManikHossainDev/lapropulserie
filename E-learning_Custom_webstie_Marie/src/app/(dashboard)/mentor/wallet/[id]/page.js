'use client';
import Link from 'next/link';
import React from 'react';
import { RxCross1 } from 'react-icons/rx';
import { useParams } from 'next/navigation';
import { useGetWithdrawalDetailsQuery } from '@/redux/api/mentorApi';

const Page = () => {
    const params = useParams();
    const id = params?.id;

    const { data, isLoading, error } = useGetWithdrawalDetailsQuery(id, {
        skip: !id,
    });

    const withdrawalData = data?.data || data;

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'approved':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'processing':
            case 'requested':
                return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'rejected':
                return 'bg-red-50 text-red-600 border-red-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const formatStatus = (status) => {
        if (!status) return 'Pending';
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    return (
        <div className="relative py-10">
            <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />
            <div className="p-5 max-w-3xl relative bg-gray-100 rounded-2xl my-5 mx-auto space-y-4">

                <div>
                    <div className="border-b border-gray-100 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Withdrawal Request Details</h2>
                        <p className="text-xs text-gray-400 mt-0.5">View details of your withdrawal request</p>
                    </div>
                    <Link href="/mentor/wallet" className="absolute top-4 right-4">
                        <RxCross1 className="absolute top-4 right-4 w-6 h-6 cursor-pointer" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                        <div className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                    </div>
                ) : withdrawalData ? (
                    <>
                        <div className="border border-gray-100 rounded-xl p-4 bg-white">
                            <p className="text-base font-semibold text-gray-700 mb-3">Bank Details</p>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Account Holder Name', value: withdrawalData.accountHolderName || 'N/A' },
                                    { label: 'Bank Name', value: withdrawalData.bankName || 'N/A' },
                                    { label: 'Bank Branch', value: withdrawalData.branchName || 'N/A' },
                                    { label: 'Account Type', value: withdrawalData.accountType || 'N/A' },
                                    { label: 'Account Number', value: withdrawalData.accountNumber || 'N/A' },
                                    { label: 'Routing Number', value: withdrawalData.routingNumber || 'N/A' },
                                    { label: 'Mobile Number', value: withdrawalData.mobileNumber || 'N/A' },
                                ].map((item) => (
                                    <div key={item.label} className="flex flex-col bg-gray-100 rounded-xl p-3">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-800 inline-block flex-shrink-0" />
                                            <span className="text-xs text-gray-400 leading-tight">{item.label}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 pl-2.5">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-4 bg-white">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Withdrawal Amount</p>
                            <p className="text-lg font-bold text-indigo-800">${(withdrawalData.amount || 0).toFixed(2)}</p>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-4 bg-white">
                            <p className="text-xs font-semibold text-gray-700 mb-3">Dates</p>
                            <div className="flex gap-8">
                                {[
                                    { 
                                        label: 'Requested Date', 
                                        value: withdrawalData.requestDate 
                                            ? new Date(withdrawalData.requestDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                            : 'N/A' 
                                    },
                                    { 
                                        label: 'Process Date', 
                                        value: withdrawalData.processDate 
                                            ? new Date(withdrawalData.processDate).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                            : 'Processing' 
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-800 inline-block" />
                                            <span className="text-xs text-gray-400">{item.label}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 pl-2.5">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-4 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <p className="text-xs font-semibold text-gray-700">Request Status</p>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusStyle(withdrawalData.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                        withdrawalData.status === 'Completed' || withdrawalData.status === 'approved' ? 'bg-green-500' : 
                                        withdrawalData.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`} />
                                    {formatStatus(withdrawalData.status)}
                                </span>
                            </div>

                            {(withdrawalData.status === 'Completed' || withdrawalData.status === 'approved') && (
                                <div className="bg-green-50 rounded-xl p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Withdrawal Completed!</h3>
                                    <Link href="/mentor/wallet" className="block w-full max-w-xs bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-3 rounded-xl tracking-widest uppercase transition">
                                        DONE
                                    </Link>
                                </div>
                            )}

                            {(withdrawalData.status === 'Requested' || withdrawalData.status === 'Processing') && (
                                <div className="bg-yellow-50 rounded-xl p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Request Pending</h3>
                                    <p className="text-sm text-gray-600 mb-4">Your withdrawal request is being processed.</p>
                                    <Link href="/mentor/wallet" className="block w-full max-w-xs bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-3 rounded-xl tracking-widest uppercase transition">
                                        BACK TO WALLET
                                    </Link>
                                </div>
                            )}

                            {withdrawalData.status === 'Rejected' && (
                                <div className="bg-red-50 rounded-xl p-6 text-center">
                                    <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Request Rejected</h3>
                                    <Link href="/mentor/wallet" className="block w-full max-w-xs bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-3 rounded-xl tracking-widest uppercase transition">
                                        BACK TO WALLET
                                    </Link>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No data found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;