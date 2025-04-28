export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="ml-2">Loading restaurant details...</p>
        </div>
    )
}
