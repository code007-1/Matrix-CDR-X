export function Loading() {

    return (
        <div>
            <div className='h-screen flex align-middle space-x-2 justify-center items-center dark:invert'>
                <span className='sr-only'>Loading...</span>
                <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                <div className='h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                <div className='h-2 w-2 bg-black rounded-full animate-bounce'></div>
            </div>
        </div>
    );
}
