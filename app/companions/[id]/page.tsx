import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCompanion } from "@/assets/lib/actions/companion.actions";
import { getSubjectColor } from "@/assets/lib/utils";
import Image from "next/image";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
    params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
    const { id } = await params;
    const companion = await getCompanion(id);
    const user = await currentUser();

    const { name = '', subject = 'general', topic = '', duration = 0 } = companion ?? {};

    if (!user) redirect('/sign-in');
    if (!name) redirect('/companions')

    return (
        <main className="mx-auto max-w-4xl px-4 py-6">
            <article
                className="
          flex items-center justify-between gap-6
          rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm
          max-md:flex-col max-md:items-start
        "
            >
                {/* Icon */}
                <div
                    className="
            hidden size-[72px] md:flex items-center justify-center rounded-lg
          "
                    style={{ backgroundColor: getSubjectColor(subject) }}
                >
                    <Image src={`/icons/${subject}.svg`} alt={subject} width={35} height={35} />
                </div>

                {/* Title + Subject + Topic */}
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-bold leading-none truncate">{name}</p>
                        <span className="rounded-full bg-black/90 px-3 py-0.5 text-[12px] font-medium text-white">
                            {subject}
                        </span>
                    </div>
                    <p className="text-zinc-600 truncate">{topic}</p>
                </div>

                {/* Duration (right) */}
                <div
                    className="
            ml-auto text-2xl font-medium whitespace-nowrap
            max-md:ml-0 max-md:text-xl"
                >
                    {duration} minutes
                </div>
            </article>
            <CompanionComponent
                {...companion}
                companionId={id}
                userName={user.firstName!}
                userImage={user.imageUrl!}

            />
        </main>
    );
}

export default CompanionSession