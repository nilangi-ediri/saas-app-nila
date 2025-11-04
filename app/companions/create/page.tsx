import { newCompanionPermissions } from "@/assets/lib/actions/companion.actions";
import CompanionForm from "@/components/ui/CompanionForm";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewCompanion() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const canCreateCompanion = await newCompanionPermissions();

    return (
        <main className="flex mx-auto max-w-4xl w-full items-start justify-center p-4 md:p-6">
            {canCreateCompanion ? (
                <article className="w-full flex flex-col gap-4">
                    <h1>Companion Builder</h1>
                    <CompanionForm />
                </article>
            ) : (
                <article className="companion-limit w-full flex flex-col items-center gap-4 text-center">
                    <Image
                        src="/images/limit.svg"
                        alt="Companion limit reached"
                        width={360}
                        height={230}
                    />
                    <div className="cta-badge">Upgrade your plan</div>
                    <h1>You&apos;ve reached your limit</h1>
                    <p>You&apos;ve reached your companion limit. Upgrade to create more companions and access premium features.</p>
                    <Link href="/subscription" className="btn-primary w-full justify-center">
                        Upgrade My Plan
                    </Link>
                </article>
            )}
        </main>
    );
}
