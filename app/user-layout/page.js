
import HomePage from '@/components/layout/HomePage'
import LadderRuleCardUser from '@/components/pages/users/LadderRuleCardUser'
import UserHeading from '@/components/pages/users/UserHeading'
import UserHeading1 from '@/components/pages/users/UserHeading1'
import UserLayout from '@/components/pages/users/UserLayout'
import DummyActivity from '@/components/shared/DummyActivity'
import DummyPlayerList from '@/components/shared/DummyPlayerList'
import React from 'react'

const UserLayoutRouter = () => {
  return (
    <div className='w-full bg-gradient-to-br from-purple-300 via-pink-200 to-indigo-400 min-h-screen '>
        <div>
          <UserHeading1 />
        
        </div>


      <div className='flex justify-between py-8 px-4'>
          <div className='w-[50%]'>
            <DummyPlayerList />
          </div>

        <div className='flex flex-col justify-center items-center '>
          <LadderRuleCardUser />
          <div className='mt-4'>
            <DummyActivity />
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default UserLayoutRouter