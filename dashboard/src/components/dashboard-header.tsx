const DashboardHeader = () => {
    return (
        <>
            <div className="float-right">
                <a href="https://github.com/donovansolms/droplets-dashboard" target="_blank" className="flex items-center space-x-2 pt-2">
                    <svg
                        className="w-6 h-6 text-white hover:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.486 2 12.012c0 4.422 2.865 8.17 6.839 9.502.5.091.683-.217.683-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.07-.607.07-.607 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.637-1.338-2.221-.253-4.555-1.114-4.555-4.956 0-1.095.39-1.99 1.029-2.688-.103-.253-.446-1.27.098-2.648 0 0 .84-.27 2.75 1.026A9.554 9.554 0 0112 6.844a9.548 9.548 0 012.508.337c1.91-1.296 2.748-1.026 2.748-1.026.546 1.379.202 2.396.1 2.648.64.699 1.028 1.593 1.028 2.688 0 3.852-2.338 4.7-4.566 4.947.36.31.68.92.68 1.856 0 1.34-.012 2.418-.012 2.746 0 .268.18.578.688.48C19.138 20.177 22 16.427 22 12.012 22 6.486 17.523 2 12 2z"
                            clipRule="evenodd"
                        />
                    </svg>
                </a>
            </div>
            <h1 className="text-3xl font-semibold mb-4">The Unofficial Droplets Dashboard</h1>
            <p className="text-gray-400">
                The information on this dashboard is collected from the public Droplets contract on Neutron and automatically updated shortly
                after the daily distribution.
            </p>
            <p className="text-gray-400">
                Feedback and requests can be sent to <a href="https://twitter.com/donovansolms" target='blank' className="drop-green hover:drop-green-text">@donovansolms</a>
            </p>
        </>
    );
}

export default DashboardHeader;