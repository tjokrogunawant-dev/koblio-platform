import Link from 'next/link';

export const metadata = {
  title: 'Subscription Cancelled — Koblio',
};

export default function SubscribeCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        <span className="text-6xl">👋</span>
        <h1 className="mt-5 text-3xl font-bold text-slate-800">
          No worries!
        </h1>
        <p className="mt-3 text-slate-500">
          You can subscribe anytime to unlock premium features for your family.
        </p>
        <Link
          href="/dashboard/parent"
          className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
