import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Book, MessageCircleQuestion } from 'lucide-react';

export function HelpView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 text-green-700 rounded-xl">
            <Book size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tutorials</h2>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Adding a Subject</h3>
            <p className="text-slate-600 mb-2">
              Click the "Add Subject" button on the main dashboard. You can manually enter the subject name, grading scale, and criteria.
            </p>
            <p className="text-slate-600">
              <strong>Pro Tip:</strong> You can upload a screenshot or PDF of your syllabus's grading system, and the app will automatically extract the criteria and weights for you!
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Inputting Grades</h3>
            <p className="text-slate-600">
              Click on any subject card to open its details. Under each criterion (e.g., "Long Exams"), click "Add Component" to input your score and the total possible score. The app will automatically compute your average and update your overall grade.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Using the Quick Calculator</h3>
            <p className="text-slate-600">
              The "Calculator" tab allows you to quickly compute grades without saving them to your main dashboard. It's perfect for "what-if" scenarios, like figuring out what score you need on a final exam to pass.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <MessageCircleQuestion size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              1. Who can see the grades?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              Only you can. All data is saved locally on your device's browser. No one else has access to the data you input here, and it is never sent to any external servers.
            </div>
          </details>

          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              2. Is this accurate?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              Yes, the calculations follow standard grading scales (like the DLSU scale). You can double-check the math manually, but the app ensures precision based on the weights and scores you provide.
            </div>
          </details>

          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              3. What files are supported when uploading the grading system/syllabus?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              You can upload any standard image file (PNG, JPG) or a PDF file. For images, you can simply take a screenshot of the "Grading System" section inside your course syllabus and upload it.
            </div>
          </details>

          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              4. Can I use this on multiple devices?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              Yes! You can use the "Export" button on the main dashboard to download a backup of your gradebook, and then use the "Import" button on your other device (like your phone or another laptop) to load your data.
            </div>
          </details>

          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              5. What happens if I clear my browser data?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              Since your grades are saved locally in your browser, clearing your site data or cache might erase your gradebook. We highly recommend using the "Export" feature regularly to back up your data!
            </div>
          </details>

          <details className="group bg-slate-50 border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 font-semibold text-slate-800 cursor-pointer">
              6. How do I manually edit weights if they are locked?
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-slate-600">
              When you upload a syllabus, the weights are locked to prevent accidental changes. You can easily unlock them by clicking the "Unlock" button next to the criteria list inside the subject details. You can lock them again anytime.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
