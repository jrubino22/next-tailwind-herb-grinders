export default function Pagination({ postsPerPage, totalPosts, paginate }) {
    const pageNumbers = [];
  
    for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    return (
      <nav className="mt-8">
        <ul className="flex justify-center space-x-2">
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className="primary-button"
                aria-label={`page ${number}`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }