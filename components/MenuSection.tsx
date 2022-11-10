import { ReactNode } from "react";

export default function MenuSection(props: {title: string, children: ReactNode}) {
    return (
        <div key={props.title} className="mt-4">
            <div className="font-bold">
                {props.title}
            </div>
            <div className="pl-3 menubody">
                {props.children}
            </div>
        </div>
    )
}