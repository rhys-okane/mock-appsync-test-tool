import type {FC} from "react"
import {useCurrentViewState} from "../../../store/hooks/UseCurrentViewState";

export const Sidebar: FC = () => {
  const [,setCurrentView] = useCurrentViewState();

  return (
    <div className="h-full left-0 w-64 bg-slate-500 text-white p-4">
      <SidebarItem label="Invoke Lambda" onClick={() => setCurrentView("invokeLambda")} />
      <SidebarItem label="AppSync" onClick={() => setCurrentView("appSync")} />
    </div>
  )
}

const SidebarItem: FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => {
  const [currentView] = useCurrentViewState();
  const isActive = currentView === label.toLowerCase().replace(" ", "");

  return (
    <button
      className={`block w-full text-left px-4 py-2 hover:bg-blue-700 ${isActive ? "bg-blue-700 rounded" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
