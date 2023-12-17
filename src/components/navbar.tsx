import Link from 'next/link'

import Logo from './logo'

export default function Navbar() {
  return (
    <header className="fixed z-10 p-4 w-[100vw] border-b border-b-slate-500">
      <nav className="flex items-center justify-between max-w-7xl mx-auto my-0">
        <div>
          <Link href="/" title="Home">
            <Logo
              className='fill-sky-300'
              aria-label='Home'
            />
          </Link>
        </div>
        <ul className="flex gap-4">
          <li>
            <Link className="link" href="/">Home</Link>
          </li>
          <li>
            <Link className="link" href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link className="link" href="/map">Map</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
