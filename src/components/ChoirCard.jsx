import {Link} from "react-router-dom";

function ChoirCard({choir}) {
    return (
        <Link to={`/choirs/${choir.id}`} className="block group">
            <div
                className='w-72 flex items-center justify-center my-3 bg-white border rounded-2xl border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200'>
                <div className='p-4'>
                    <h3 className='font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors'>
                        {choir.full_name}
                    </h3>
                </div>

            </div>
        </Link>
    );
}

export default ChoirCard;