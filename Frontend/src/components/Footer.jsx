import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDiscord,
  faInstagram,
  faWhatsapp,
  faYoutube,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-gray-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Top: Brand + Project Info */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand / Project */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/20">
              A
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Anozon
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                A full‑stack e‑commerce experience built with FastAPI, React, and
                modern UI. This project is part of my developer portfolio.
              </p>
            </div>
          </div>

          {/* Project Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                Built With
              </h3>
              <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                <li>FastAPI · Python</li>
                <li>React · Vite</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                Project
              </h3>
              <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Authentication & Cart</li>
                <li>Protected Routes</li>
                <li>Responsive UI/UX</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                Status
              </h3>
              <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Portfolio Project</li>
                <li>Open to feedback</li>
                <li>Actively improving</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-dashed border-slate-200 dark:border-slate-800" />

        {/* Bottom: Author + Socials */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Author / “Built by” */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 via-sky-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-md">
              H
            </div>
            <div className="text-sm">
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">Designed & built by</span>{' '}
                <span className="underline underline-offset-4 decoration-blue-500/70">
                  Harish Palanivel
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Developer portfolio project · {year}
              </p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Connect
            </span>
            <div className="flex items-center gap-3">
              {/* Replace hrefs with your real profiles */}
              <a
                href="https://github.com/your-github"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow hover:shadow-lg transition-all"
                aria-label="GitHub"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://linkedin.com/in/your-linkedin"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-sky-600 text-white shadow hover:shadow-lg hover:bg-sky-700 transition-all"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://instagram.com/your-instagram"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 text-white shadow hover:shadow-lg transition-all"
                aria-label="Instagram"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://wa.me/your-number"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-emerald-500 text-white shadow hover:shadow-lg hover:bg-emerald-600 transition-all"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon
                  icon={faWhatsapp}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://discord.gg/your-server"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-indigo-600 text-white shadow hover:shadow-lg hover:bg-indigo-700 transition-all"
                aria-label="Discord"
              >
                <FontAwesomeIcon
                  icon={faDiscord}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
              <a
                href="https://youtube.com/your-channel"
                target="_blank"
                rel="noreferrer"
                className="group p-2 rounded-full bg-red-600 text-white shadow hover:shadow-lg hover:bg-red-700 transition-all"
                aria-label="YouTube"
              >
                <FontAwesomeIcon
                  icon={faYoutube}
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Tiny bottom line */}
        <div className="mt-6 text-[11px] text-center text-slate-500 dark:text-slate-500">
          <span className="opacity-90">
            Crafted with React, FastAPI & Tailwind · Deployed as a portfolio
            showcase.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer