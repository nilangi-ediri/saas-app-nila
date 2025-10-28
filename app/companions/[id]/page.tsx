import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCompanion } from "@/assets/lib/actions/companion.actions";

interface CompanionSessionPageProps {
    params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
    const { id } = await params;
    const companion = await getCompanion(id);
    const user = await currentUser();

    if (!user) redirect('/sign-in');
    if (!companion) redirect('/companions')

    return (
        <div>CompanionSession</div>
    )
}

export default CompanionSession