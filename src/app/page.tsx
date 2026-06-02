import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { MainContent } from '@/components/layout/MainContent'
import { RightPanel } from '@/components/layout/RightPanel'

export default function Home() {
  return (
    <div className="flex h-full">
      <LeftSidebar />
      <MainContent />
      <RightPanel />
    </div>
  )
}
