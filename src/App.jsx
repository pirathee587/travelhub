import React from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function App() {
  return (
    <div className="app-root" style={{display:'flex',minHeight:'100vh',fontFamily:'Inter, ui-sans-serif'}}>
      <Sidebar />
      <div style={{flex:1,banckground:'#f6f7f9'}}>
        <Header />
        <main style={{padding:24}}>
          <section style={{background:'white',padding:24,borderRadius:8}}>
            <h2 style={{margin:0}}>Dashboard</h2>
            <p style={{color:'#6b7280'}}>Welcome to Admin Portal — Sri Lanka Tourism</p>
            <div style={{height:300,marginTop:16,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,background:'#ecfdf5',color:'#065f46'}}>
              Analytics charts placeholder
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
