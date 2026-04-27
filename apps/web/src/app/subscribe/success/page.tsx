import Link from 'next/link';

export const metadata = {
  title: 'Subscription Confirmed — Koblio',
};

export default function SubscribeSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        <span className="text-6xl">🎉</span>
        <h1 className="mt-5 text-3xl font-bold text-slate-800">
          Payment Successful!
        </h1>
        <p className="mt-3 text-slate-500">
          Your account is now Premium. Enjoy unlimited problems and detailed
          progress reports.
        </p>
        <Link
          href="/dashboard/parent"
          className="mt-8 inline-block rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
