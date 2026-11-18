import React from 'react';

function Card({children, className}) {
    return (
        <div className={`${className} p-5 overflow-hidden m-5  rounded-lg  w-full border border-gray-200 `}>
            {children}
        </div>
    );
}

export default Card;