function extractInfo(text) {
    const patterns = ['/located in (^,.)/i',
        '/in (^.,)/i',
        '/at (^.,)/i'
    ]
    for(const pattern of patterns) {
        const match = pattern.match(text);
        if(match) return match[1].trim();
    }
    return null;
}

export default extractInfo;