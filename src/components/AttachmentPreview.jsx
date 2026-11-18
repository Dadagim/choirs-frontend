import {api} from '../api.js';

const audioExtensions = new Set(['aac', 'm4a', 'mp3', 'ogg', 'wav']);
const videoExtensions = new Set(['avi', 'mkv', 'mov', 'mp4', 'webm']);
const documentLabels = {
    doc: 'Word document',
    docx: 'Word document',
    odt: 'OpenDocument text',
    pdf: 'PDF document',
    rtf: 'Rich text document',
    txt: 'Text document',
};

function AttachmentPreview({name, url}) {
    const fileName = name || 'Shared file';
    const extension = fileName.includes('.')
        ? fileName.split('.').pop().toLowerCase()
        : '';
    const fileUrl = new URL(url, api.defaults.baseURL).toString();

    return (
        <div className="mt-3 max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white">
            {extension === 'pdf' && (
                <iframe className="h-96 w-full border-0" src={fileUrl} title={`Preview of ${fileName}`}/>
            )}
            {audioExtensions.has(extension) && (
                <div className="p-4">
                    <p className="mb-3 text-sm font-medium text-slate-800">Audio preview</p>
                    <audio className="w-full" controls preload="metadata" src={fileUrl}>
                        Your browser does not support audio playback.
                    </audio>
                </div>
            )}
            {videoExtensions.has(extension) && (
                <video className="max-h-[28rem] w-full bg-black" controls preload="metadata" src={fileUrl}>
                    Your browser does not support video playback.
                </video>
            )}
            {!audioExtensions.has(extension) && !videoExtensions.has(extension) && extension !== 'pdf' && (
                <div className="flex items-center gap-4 p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold uppercase text-indigo-700">
                        {extension || 'file'}
                    </span>
                    <div className="min-w-0">
                        <p className="break-all font-semibold text-slate-900">{fileName}</p>
                        <p className="text-sm text-slate-500">{documentLabels[extension] || 'Shared file'}</p>
                    </div>
                </div>
            )}
            <div className="border-t border-slate-200 px-4 py-2">
                <a className="text-sm font-semibold text-indigo-700 underline"
                   href={fileUrl} download={fileName}>
                    Download {fileName}
                </a>
            </div>
        </div>
    );
}

export default AttachmentPreview;
