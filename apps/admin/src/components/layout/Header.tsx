import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="text-sm text-gray-500">SwissFarm Admin</div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <span className="text-sm text-gray-600">Admin</span>
        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold select-none">
          A
        </div>
      </div>
    </header>
  );
}