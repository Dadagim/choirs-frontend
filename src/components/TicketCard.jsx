export default function TicketCard({ tierName, price }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-gray-800">{tierName}</h4>
        <span className="text-indigo-600 font-semibold">${price}</span>
      </div>
      
      {/* Inner shadow input field variant */}
      <input 
        type="number" 
        placeholder="Qty" 
        className="mt-3 w-full p-2 border border-gray-300 rounded-md shadow-inner bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}