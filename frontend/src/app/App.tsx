import { type FC } from 'react'
import './App.css'
import {InvokeLambda} from './components/invoke-lambda/InvokeLambda';
import {Sidebar} from './components/sidebar/Sidebar';
import {useCurrentViewState} from '../store/hooks/UseCurrentViewState';
import {AppSync} from './components/appsync/AppSync';

export const App: FC = () =>  {
  const [currentView] = useCurrentViewState();

  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-100">
      <Sidebar/>
      {currentView === "invokeLambda" && <InvokeLambda />}
      {currentView === "appSync" && <AppSync/>}
    </div>
  )
}

export default App
