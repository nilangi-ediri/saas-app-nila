import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCompanion } from "@/assets/lib/actions/companion.actions";
import { getSubjectColor } from "@/assets/lib/utils";
import Image from "next/image";

interface CompanionSessionPageProps {
    params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
    const { id } = await params;
    const companion = await getCompanion(id);
    const user = await currentUser();

    if (!user) redirect('/sign-in');
    if (!companion) redirect('/companions')

    console.log(companion)

    return (
        <main>
            <article className="flex rounded-border justify-between p-6 max-md:flex-col">
                <div className="flex items-center gap-2">
                    <div className="size-[72px] flex items-center justify center rounded-lg max-md:hidden" style={{ backgroundColor: getSubjectColor(companion.subject) }}
                    ></div>
                    <Image src={`/icons/${companion.subject}.svg`} alt={companion.subject} width={35} height={35} />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2"></div>
                </div>

            </article>
        </main >
    );
}

export default CompanionSession