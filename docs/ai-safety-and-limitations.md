# Safety and limitations
Plans are drafts, not evidence of research, compliance or business performance. Review claims and targeting before external use. Provider refusal, incomplete output and invalid plans fail generation. Low-confidence approval requires an acknowledgment and note.
The app is an unauthenticated local MVP. Reviewer identity is not asserted. Do not expose the loopback server through a public tunnel or proxy.
SQLite requires persistent local disk. Automatic legacy import validates every record and retains the original JSON. Storage failures do not initialize an empty replacement.
n8n must have Header Auth enabled with the expected secret. The provider credential is separate. Successful/error execution payload storage is disabled in the export; manual n8n executions may still retain data. Submit only suitable data and check your n8n retention settings.
Local fixtures do not establish live n8n/provider success. Claude is not implemented.
