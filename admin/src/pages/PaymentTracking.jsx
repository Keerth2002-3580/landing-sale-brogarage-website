import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, ShieldCheck, ArrowDownCircle } from 'lucide-react';

export default function PaymentTracking({ adminToken }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [adminToken]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/payments', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Payment Tracking</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Audit logs of premium listing fees and active subscriptions</p>
        </div>

        {/* Sum card */}
        <div className="bg-white dark:bg-gray-900 p-4 border dark:border-gray-800 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-green-55/15 text-green-600 dark:bg-green-950/20 dark:text-green-455 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Total Revenue</span>
            <span className="text-sm font-black text-gray-900 dark:text-white mt-0.5 block">Rs. {totalCollected.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading transaction logs...</div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-950 border-b dark:border-gray-805 text-gray-400 font-mono uppercase tracking-wider">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Client User</th>
                  <th className="p-4">Category Item</th>
                  <th className="p-4">Listing Target</th>
                  <th className="p-4">Paid Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-850">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                    <td className="p-4 font-mono text-gray-500 text-[10px]">{pay._id}</td>
                    
                    {/* User */}
                    <td className="p-4">
                      <span className="font-semibold block text-gray-700 dark:text-gray-300">{pay.userId?.name}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{pay.userId?.email}</span>
                    </td>

                    {/* type */}
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pay.type === 'agent_subscription'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'
                      }`}>
                        {pay.type === 'agent_subscription' ? 'Broker Plan' : 'Featured Ad'}
                      </span>
                    </td>

                    {/* Land title */}
                    <td className="p-4 text-gray-650 dark:text-gray-350 max-w-[150px] truncate">
                      {pay.landId ? pay.landId.title : 'N/A (Subscription)'}
                    </td>

                    {/* amount */}
                    <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                      Rs. {pay.amount.toLocaleString()}
                    </td>

                    {/* status */}
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-455 font-bold uppercase text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {pay.status}
                      </span>
                    </td>

                    {/* date */}
                    <td className="p-4 text-gray-450">{new Date(pay.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-450">
            <ArrowDownCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No transactions recorded in logging buffers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
