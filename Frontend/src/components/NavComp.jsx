

const NavComp = ({ product }) => {
  return (
    <div
      className="
        group flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer
        bg-white/80 dark:bg-slate-900/80
        border border-gray-100/80 dark:border-slate-700/80
        shadow-sm hover:shadow-lg
        hover:bg-gray-50/90 dark:hover:bg-slate-800/90
        backdrop-blur-md
        transition-all duration-200
      "
    >
      <div className="relative flex-shrink-0">
        <img
          className="
            object-cover w-10 h-10 rounded-xl
            border border-gray-200 dark:border-slate-700
            shadow-sm
            group-hover:scale-105 group-hover:shadow-md
            transition-transform duration-200
          "
          src={product.url}
          alt={product.name}
        />
        <span
          className="
            absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full
            bg-blue-600 text-white font-semibold
            shadow-sm
            group-hover:translate-y-[-1px]
            transition-transform duration-200
          "
        >
          ${Number(product.price).toFixed(0)}
        </span>
      </div>

      <div className="flex flex-col min-w-0">
        <h1
          className="
            text-xs font-semibold tracking-wide
            text-gray-800 dark:text-gray-100
            group-hover:text-blue-600 dark:group-hover:text-blue-400
            truncate
          "
        >
          {product.name}
        </h1>
        <p
          className="
            text-[11px] text-gray-500 dark:text-gray-400
            line-clamp-1
          "
        >
          Quick view · Tap to open
        </p>
      </div>
    </div>
  )
}

export default NavComp

