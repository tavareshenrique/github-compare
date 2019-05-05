import React, { Component } from 'react';
import moment from 'moment';
import api from '../../services/api';

import logo from '../../assets/logo.png';

import { Container, Form } from './styles';
import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryInput: '',
    repositories: [],
    repositoryError: false,
    loadingUpdate: false,
  };

  componentDidMount() {
    if (typeof Storage !== 'undefined') {
      const repo = JSON.parse(localStorage.getItem('@repo'));
      this.setState({
        repositories: repo,
      });
    }
  }

  setLocalStorage = (repo) => {
    localStorage.setItem('@repo', JSON.stringify(repo));
  };

  removeRepo = (repoName) => {
    const { repositories } = this.state;
    const arrRepo = repositories.filter(el => el.name !== repoName);
    this.setState(
      {
        repositories: arrRepo,
      },
      () => this.setLocalStorage(arrRepo),
    );

    return arrRepo;
  };

  updateRepo = async (repoName, fullName) => {
    this.setState({ loadingUpdate: true });

    try {
      const arrRepo = this.removeRepo(repoName);

      const { data: repository } = await api.get(`/repos/${fullName}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      arrRepo.unshift(repository);
      this.setState(
        {
          repositories: arrRepo,
        },
        () => this.setLocalStorage(arrRepo),
      );
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({
        loadingUpdate: false,
      });
    }
  };

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { repositoryInput, repositories } = this.state;

      const { data: repository } = await api.get(`/repos/${repositoryInput}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState(
        {
          repositoryInput: '',
          repositories: [...repositories, repository],
          repositoryError: false,
        },
        () => {
          this.setLocalStorage(this.state.repositories);
        },
      );
    } catch (err) {
      this.setState({
        repositoryError: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const {
      repositories, repositoryInput, repositoryError, loading, loadingUpdate,
    } = this.state;

    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form withError={repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositorio"
            value={repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">{loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}</button>
        </Form>

        <CompareList
          repositories={repositories}
          removeRepo={this.removeRepo}
          updateRepo={this.updateRepo}
          loadUpdate={loadingUpdate}
        />
      </Container>
    );
  }
}
