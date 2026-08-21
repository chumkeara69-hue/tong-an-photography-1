import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header style={{borderBottom:"1px solid #222a33", background:"#0b0f14"}}>
      <div className="container" style={{height:72,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link href="/" style={{fontWeight:800,letterSpacing:1}}>TONG AN <span style={{color:"#d5a43a"}}>PHOTOGRAPHY</span></Link>
        <nav style={{display:"flex",gap:22,fontSize:14}}><Link href="/photos">Photos</Link><Link href="/cart">Cart</Link><Link href="/admin/login">Admin</Link></nav>
      </div>
    </header>
    {children}
    <footer style={{borderTop:"1px solid #222a33",marginTop:60,padding:"28px 0",color:"#94a3b8"}}><div className="container">© 2026 Tong An Photography — Version 3</div></footer>
  </body></html>;
}
