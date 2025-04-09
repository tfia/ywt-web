export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:gap-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} YWT AI TA System. All rights reserved.
        </p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            The panel is designed and coded by Ruohe Du.
        </p>
      </div>
    </footer>
  )
}
