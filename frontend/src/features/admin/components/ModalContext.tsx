import React, { createContext, useContext, useState, useCallback } from 'react'
import ConfirmModal from './ConfirmModal'
import HotelDetailsModal from './HotelDetailsModal'
import PackageDetailsModal from './PackageDetailsModal'
import AgentDetailsModal from './AgentDetailsModal'
import ToastContainer from './ToastContainer'
import AdminProfileModal from './AdminProfileModal'

interface ModalContextType {
  showConfirm: (opts?: { title?: string; message?: string }) => Promise<boolean>;
  addToast: (text: string) => void;
  showHotelDetails: (hotel: any) => void;
  closeHotelDetails: () => void;
  showPackageDetails: (pkg: any) => void;
  closePackageDetails: () => void;
  showAgentDetails: (agent: any) => void;
  closeAgentDetails: () => void;
  showAdminProfile: () => void;
  closeAdminProfile: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null)

export function useModal(){
  return useContext(ModalContext)
}

export default function ModalProvider({children}: {children: React.ReactNode}){
  const [modal, setModal] = useState({open:false,title:'',message:''})
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)
  const [toasts, setToasts] = useState<Array<{ id: string; text: string }>>([])
  const [hotelDetailsModal, setHotelDetailsModal] = useState<{ open: boolean; hotel: any }>({open:false,hotel:null})
  const [packageDetailsModal, setPackageDetailsModal] = useState<{ open: boolean; pkg: any }>({open:false,pkg:null})
  const [agentDetailsModal, setAgentDetailsModal] = useState<{ open: boolean; agent: any }>({open:false,agent:null})
  const [adminProfileOpen, setAdminProfileOpen] = useState(false)

  const showConfirm = useCallback((opts: { title?: string; message?: string } = {})=>{
    return new Promise<boolean>((resolve)=>{
      setModal({open:true,title:opts.title||'Confirm',message:opts.message||'Are you sure?'})
      setResolver(() => resolve)
    })
  },[])

  const closeModal = useCallback(()=>{
    setModal({open:false,title:'',message:''})
    setResolver(null)
  },[])

  const handleConfirm = useCallback(()=>{
    if(resolver) resolver(true)
    closeModal()
  },[resolver,closeModal])

  const handleCancel = useCallback(()=>{
    if(resolver) resolver(false)
    closeModal()
  },[resolver,closeModal])

  const addToast = useCallback((text: string)=>{
    const id = Date.now().toString()
    setToasts(t => [...t,{id,text}])
    setTimeout(()=>{ setToasts(t => t.filter(x=>x.id!==id)) },4000)
  },[])

  const showHotelDetails = useCallback((hotel: any)=>{
    setHotelDetailsModal({open:true,hotel})
  },[])

  const closeHotelDetails = useCallback(()=>{
    setHotelDetailsModal({open:false,hotel:null})
  },[])

  const showPackageDetails = useCallback((pkg: any)=>{
    setPackageDetailsModal({open:true,pkg})
  },[])

  const closePackageDetails = useCallback(()=>{
    setPackageDetailsModal({open:false,pkg:null})
  },[])

  const showAgentDetails = useCallback((agent: any)=>{
    setAgentDetailsModal({open:true,agent})
  },[])

  const closeAgentDetails = useCallback(()=>{
    setAgentDetailsModal({open:false,agent:null})
  },[])

  const showAdminProfile = useCallback(() => {
    setAdminProfileOpen(true)
  }, [])

  const closeAdminProfile = useCallback(() => {
    setAdminProfileOpen(false)
  }, [])

  return (
    <ModalContext.Provider value={{ 
      showConfirm, 
      addToast, 
      showHotelDetails, 
      closeHotelDetails, 
      showPackageDetails, 
      closePackageDetails, 
      showAgentDetails, 
      closeAgentDetails,
      showAdminProfile,
      closeAdminProfile
    }}>
      {children}
      <ConfirmModal open={modal.open} title={modal.title} message={modal.message} onConfirm={handleConfirm} onCancel={handleCancel} />
      <HotelDetailsModal open={hotelDetailsModal.open} hotel={hotelDetailsModal.hotel} onClose={closeHotelDetails} />
      <PackageDetailsModal open={packageDetailsModal.open} pkg={packageDetailsModal.pkg} onClose={closePackageDetails} />
      <AgentDetailsModal open={agentDetailsModal.open} agent={agentDetailsModal.agent} onClose={closeAgentDetails} />
      {adminProfileOpen && <AdminProfileModal open={adminProfileOpen} onClose={closeAdminProfile} />}
      <ToastContainer toasts={toasts} />
    </ModalContext.Provider>
  )
}
