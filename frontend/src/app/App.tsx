import { type FC } from 'react'
import './App.css'
import {InvokeLambda} from './components/invoke-lambda/InvokeLambda';

export const App: FC = () =>  {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-100">
      <InvokeLambda/>
    </div>
  )
}

export default App
