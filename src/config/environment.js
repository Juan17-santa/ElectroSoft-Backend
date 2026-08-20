const requiredEnvironmentVariables = ["MONGODB_URI", "JWT_SECRET"];

export const validateEnvironment = () => {
    const missing = requiredEnvironmentVariables.filter(name => !process.env[name]?.trim());

    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(", ")}`);
    }
};