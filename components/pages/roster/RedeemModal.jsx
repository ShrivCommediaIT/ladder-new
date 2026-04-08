import React from "react";

const RedeemModal = ({ open, onClose, player, history, loading }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-3">

            {/* MODAL BOX */}
            <div className="w-full max-w-md bg-black text-white rounded-xl border border-white/20 shadow-xl overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                    <h2 className="text-lg font-bold text-cyan-400">Redeem Tokens</h2>
                    <button onClick={onClose} className="text-white text-xl cursor-pointer">×</button>
                </div>

                <div className="p-4 space-y-4">

                    {/* DISCOUNT TABLE */}
                    <div className="border border-white/20 p-3 text-sm">
                        <p className="font-bold mb-2 text-cyan-400">Discounts offered by SPONSOR</p>

                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className='text-cyan-400'>Tokens Saved</span>
                                <span className='text-cyan-400'>Discount</span>
                            </div>
                            <div className="flex justify-between">
                                <span>5 Tokens</span>
                                <span>5%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>10 Tokens</span>
                                <span>10%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>15 Tokens</span>
                                <span>15%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>20 Tokens</span>
                                <span>20% (maximum)</span>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER INFO */}
                    <div>
                        <p className="font-bold text-base mb-3 text-cyan-400">{player?.name}</p>
                        <p className="text-xs text-gray-300">
                            Total Tokens Earned <span className="text-cyan-400">{player?.total_token ?? 0}</span> 
                        </p>
                        <p className="text-xs text-gray-300">
                            Total Tokens Redeemed <span className="text-cyan-400">0</span>
                        </p>
                    </div>

                    {/* TOKENS LEFT */}
                    <div className="text-sm">
                        You have:{" "}
                        <span className="text-cyan-400 font-bold">
                            {player?.today_token ?? 0}
                        </span>{" "}
                        Tokens to{" "}
                        <span className="text-cyan-400 underline cursor-pointer">
                            Redeem
                        </span>
                    </div>

                    {/* HISTORY */}
                    <div>
                        <p className="font-bold border-t border-white/10 pt-2 mb-2 text-cyan-400">
                            HISTORY
                        </p>

                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                            {loading ? (
                                <p className="text-center text-sm text-gray-400">Loading...</p>
                            ) : history.length === 0 ? (
                                <p className="text-center text-sm text-gray-400">
                                    No history found
                                </p>
                            ) : (
                                history.map((item, index) => (
                                    <div
                                        key={index}
                                        className="text-xs border-b border-white/10 pb-1"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <span className="text-cyan-500 pr-5">
                                                {index + 1} 
                                            </span>
                                            <span >
                                                {item.date}
                                            </span>
                                            </div>
                                            
                                            <span>totals {item.total_token}</span>
                                        </div>
                                        <div className="text-gray-400">{item.ladder_name}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-3 border-t border-white/10 flex justify-end cursor-pointer">
                    <button
                        onClick={onClose}
                        className="px-4 py-1 bg-cyan-500 text-black font-semibold rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RedeemModal