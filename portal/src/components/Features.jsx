import React from 'react'
import { Card,  CardDescription,  CardHeader, CardTitle } from './ui/card'
import bustrack from '../assets/bustrack.jpg'
import face from '../assets/face.jpg'
import notification from'../assets/notification.avif'
import noti from '../assets/noti.png'
const Features = () => {
  return (
    <div className='flex  items-center justify-center gap-10'>
         <Card className="w-1/2 border border-gray-200 rounded-md w-[350px]">
      <CardHeader>
        <CardTitle>Real-Time Tracking</CardTitle>
        <CardDescription>Monitor school buses in real-time to ensure your child’s safety</CardDescription>
      </CardHeader>
      <div className="p-4">
          <img src={bustrack} alt="Bus Tracking Illustration" className="rounded-md" />
        </div>
    </Card>
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Face Recognition</CardTitle>
        <CardDescription>Advanced live camera face recognition for accurate verification.
        </CardDescription>
      </CardHeader>
      <div className="p-4">
          <img src={face} alt="face recongnition" className="rounded-md" />
        </div>
     
    </Card>
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Instant Notifications</CardTitle>
        <CardDescription>Receive SMS alerts for pickups, drop-offs, and absences.</CardDescription>
      </CardHeader>
      <div className="p-4">
          <img src={noti} alt="Bus Tracking notofication" className="rounded-md" />
        </div>
    </Card>
    
    
    </div>
  )
}

export default Features