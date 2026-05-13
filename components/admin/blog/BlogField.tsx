export const BlogField = ({ label, defaultValue, name, type, required }: {
    label: string
    defaultValue?: string
    name: string
    type?: string
    required?: boolean
}) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
        </label>
        <input
            name={name}
            defaultValue={defaultValue}
            type={type}
            required={required}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-violet)] outline-none"
        />
    </div>
)
