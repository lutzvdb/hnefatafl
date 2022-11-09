import { useEffect, useState } from "react";
import { getApp, App } from "realm-web";

export function useMongoDBApp() { 
    if (!process.env.NEXT_PUBLIC_APP_ID) return

    return getApp(process.env.NEXT_PUBLIC_APP_ID)
}