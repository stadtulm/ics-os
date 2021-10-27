import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "urql";
import { CreateProjectDocument } from "../../client/graphql/createProject.generated";
import { useGetCurrentUserQuery } from "../../client/graphql/getCurrentUser.generated";

export default function Dashboard() {
  const router = useRouter();
  const [{ data, fetching, error }] = useGetCurrentUserQuery();
  const [, createProject] = useMutation(CreateProjectDocument);
  const [name, setName] = useState("");

  if (fetching) return <p>Loading...</p>;

  if (error) return <p>{error.message}</p>;

  if (!data?.currentUser) {
    if (process.browser) router.push("/");
    return (
      <p>
        Redirecting to <Link href="/">/login</Link>
        ...
      </p>
    );
  }

  return (
    <>
      {/* <h1>Hello {data.currentUser.name}!</h1>
      <ul>
        {data.currentUser.projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/app/${project.slug}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
      <input
        placeholder="Hooli Inc."
        value={name}
        onChange={(evt) => setName(evt.target.value)}
      />
      <button
        disabled={!name}
        onClick={() => {
          createProject({
            name,
          }).then((result) => {
            const slug = result.data?.createProject?.slug;
            if (slug) router.push(`/app/${slug}`);
          });
        }}
      >
        Create project
      </button>
      <Link href="/app/settings">Settings</Link>
      <Link href="/api/auth/logout">Logout</Link> */}
      <div className="mx-auto w-full sm:w-9/12 sm:py-8 py-0">
        {/* <h1>Hello {data.currentUser.name}!</h1> */}
        <section>
          {/* <h2 className="text-xl my-4 text-gray-500">Projektverwaltung</h2> */}
          <h3 className="m-6 text-xl text-gray-500 my-3">
            Hello {data.currentUser.email}!
          </h3>
          <div className="flex flex-col">
            <div className=" overflow-x-auto mx-0 sm:-mx-6 lg:-mx-8">
              <div className="align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Project
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.currentUser.projects.map((project) => (
                        <tr key={project.id}>
                          <td className="text-lg flex justify-between items-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link href={`/app/${project.slug}`}>
                              {project.name}
                            </Link>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="flex items-center  justify-between px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input
                            placeholder="Hooli Inc."
                            value={name}
                            type="text"
                            onChange={(evt) => setName(evt.target.value)}
                            className="max-w-lg block w-full shadow-sm focus:ring-gray-400 focus:border-gray-400 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                          />

                          <button
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 focus:outline-none"
                            disabled={!name}
                            onClick={() => {
                              createProject({
                                name,
                              }).then((result) => {
                                const slug = result.data?.createProject?.slug;
                                if (slug) router.push(`/app/${slug}`);
                              });
                            }}
                          >
                            Create project
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <Link href="/api/auth/logout">Logout</Link> */}
      </div>
    </>
  );
}
