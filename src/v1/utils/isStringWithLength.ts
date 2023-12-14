export  function isStringWithLength(input: unknown): string | false {
    return typeof input === 'string' && input.length > 0 ? input : false
} 