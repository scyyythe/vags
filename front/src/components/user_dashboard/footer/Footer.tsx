import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="w-[100%] border-t bg-gray-100 py-2 border-none">
      <div className="container flex items-center justify-between px-4 md:px-6">
        <div className="flex gap-4 text-[10px] text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
            </a>
            <a href="/license" className="hover:text-foreground transition-colors">
                License
            </a>
            
        </div>
        
        <div className="text-[10px] text-muted-foreground">
            &copy;{currentYear} All rights reserved
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-[10px] text-muted-foreground mr-2">English</span>
            <i className='bx bx-world text-gray-400' ></i>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
