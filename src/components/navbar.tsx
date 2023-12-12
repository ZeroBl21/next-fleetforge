import {
  FiBook,
  FiHome,
  FiBookmark,
  FiSettings,
  FiEye
} from 'react-icons/fi'

export default function Navbar() {
  return (
    <header className="fixed z-10 p-4 w-[100vw] border-b border-b-slate-500">
      <nav className="flex items-center justify-between max-w-7xl mx-auto my-0">
        <div>
          <a href="/" title="Home">
            <FiHome
              size={24}
              aria-label='Home'
            />
          </a>
        </div>
        <ul className="flex gap-4">
          <li>
            <a className="link" href="/">Home</a>
          </li>
          <li>
            <a className="link" href="/bookshelf">Bookshelf</a>
          </li>
          <li>
            <a className="link" href="/about">about</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
