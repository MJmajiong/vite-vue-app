const LOCAL_KEY = "todumvc"

export function fetch() {
    const result = localStorage.getItem(LOCAL_KEY)
    if(result) {
        return JSON.parse(result)
    }
    return []
}