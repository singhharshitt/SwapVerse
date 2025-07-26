import { useState, useEffect } from 'react'; 
import history from '../assets/history.png';
import { Link } from "react-router-dom";

export default function History() {
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            from: "Token A",
            to: "Token B",
            amount: "100",
            date: "2024-01-15",
            status: "Completed"
        },
        {
            id: 2,
            from: "Token B",
            to: "Token A",
            amount: "50",
            date: "2024-01-14",
            status: "Completed"
        }
    ]);

    return (
        <>
            {/* Navbar */}
            <nav className="flex items-center justify-between sticky top-0 z-50 bg-[#07090F] p-4 md:p-8 border-b border-gray-800">
                <div className="flex items-center">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                        <h2 className="text-2xl md:text-4xl text-[#D6C3C9]" style={{ fontFamily: '"Pacifico", cursive' }}>
                            SwapVerse
                        </h2>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <img src={history} alt="history" className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <button className="border-2 border-white bg-[#D6C3C9] px-4 py-2 rounded-xl hover:bg-[#C4B1B7] transition-colors">
                        <span className="text-sm md:text-md text-white font-semibold" style={{ fontFamily: '"Roboto", sans-serif' }}>
                            Connect Wallet
                        </span>
                    </button>
                </div>
            </nav>

            {/* History Content */}
            <div className="min-h-screen bg-[#07090F] p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: '"Pacifico", cursive' }}>
                            Transaction History
                        </h1>
                        <Link 
                            to="/" 
                            className="text-[#D6C3C9] hover:text-white transition-colors text-lg"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center">
                            <p className="text-gray-400 text-lg">No transactions found</p>
                            <p className="text-gray-500 mt-2">Your swap history will appear here</p>
                        </div>
                    ) : (
                        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-white font-semibold">Transaction ID</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold">From</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold">To</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold">Amount</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                                            <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 text-gray-300">#{tx.id}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.from}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.to}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.amount}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
