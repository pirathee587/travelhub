import React, { createContext, useContext, useState, useCallback } from 'react'
import ConfirmModal from './ConfirmModal'
import HotelDetailsModal from './HotelDetailsModal'
import PackageDetailsModal from './PackageDetailsModal'
import AgentDetailsModal from './AgentDetailsModal'
import ToastContainer from './ToastContainer'
import AdminProfileModal from './AdminProfileModal'

const ModalContext = createContext(null)

export function useModal(){
  return useContext(ModalContext)
}

export default function ModalProvider({children}){
  const [modal, setModal] = useState({open:false,title:'',message:''})
  const [resolver, setResolver] = useState(null)
  const [toasts, setToasts] = useState([])
  const [hotelDetailsModal, setHotelDetailsModal] = useState({open:false,hotel:null})
  const [packageDetailsModal, setPackageDetailsModal] = useState({open:false,pkg:null})
  const [agentDetailsModal, setAgentDetailsModal] = useState({open:false,agent:null})
  const [adminProfileOpen, setAdminProfileOpen] = useState(false)

  const showConfirm = useCallback((opts={})=>{
    return new Promise((resolve)=>{
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

  const addToast = useCallback((text)=>{
    const id = Date.now().toString()
    setToasts(t => [...t,{id,text}])
    setTimeout(()=>{ setToasts(t => t.filter(x=>x.id!==id)) },4000)
  },[])

  const showHotelDetails = useCallback((hotel)=>{
    setHotelDetailsModal({open:true,hotel})
  },[])

  const closeHotelDetails = useCallback(()=>{
    setHotelDetailsModal({open:false,hotel:null})
  },[])

  const showPackageDetails = useCallback((pkg)=>{
    setPackageDetailsModal({open:true,pkg})
  },[])

  const closePackageDetails = useCallback(()=>{
    setPackageDetailsModal({open:false,pkg:null})
  },[])

  const showAgentDetails = useCallback((agent)=>{
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
