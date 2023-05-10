export default function generateChannelCompoundName(emailA: string, emailB: string): string {
    if (!emailA || !emailB) return undefined;
    if (emailA < emailB) return `@${emailA}_${emailB}`;
    else if (emailA > emailB) return `@${emailB}_${emailA}`;
    else return undefined;
}
